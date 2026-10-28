/**
 * 可读性循环脚本共用的项目探测：定位项目根目录、断点目录、构建系统，以及检查阈值。
 * 不依赖任何项目内配置文件；探测不准时由调用方用 readability-verify 的 --build / --test 覆盖。
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const IS_WIN = process.platform === 'win32';

/** check-readability 的阈值与匹配模式，数值与 rubric.md 中的默认值一致。 */
export const CHECKER = {
  maxFileCodeLines: 300,
  maxMethodLines: 40,
  maxNesting: 3,
  stepRequiredStatements: 4,
  forwardingClassMaxCodeLines: 40,
  duplicateStateMinFiles: 3,
  maxPackageFiles: 8,
  packageGroupMinFiles: 3,
  mainSourceDir: /[\\/]src[\\/]main[\\/]/,
  hotPathMethod: /^(onDrawFrame|onFrame\w*|draw\w*|render\w*Frame|advance\w*|synchronize\w*|prepareFrame\w*|tick\w*|onUpdate|onTick)$/,
  logCall: /\b(\w*Log\.[a-z]\w*|log(Info|Debug|Warn|Error|ger\.[a-z]+)|Timber\.[a-z]|println|console\.(log|info|debug|warn))\s*[({]/,
};

/** 判定源码文件的扩展名（stale-check 与范围统计用；词法检查目前只解析 .kt）。 */
export const SOURCE_EXTENSIONS = ['.kt', '.kts', '.java', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.py', '.go', '.rs', '.cs', '.c', '.cc', '.cpp', '.h', '.hpp', '.swift', '.dart'];

/** 定位项目根目录：环境变量 READABILITY_PROJECT_ROOT → 从当前目录向上找 .git → 当前目录。 */
export function findProjectRoot(start = process.cwd()) {
  if (process.env.READABILITY_PROJECT_ROOT) return path.resolve(process.env.READABILITY_PROJECT_ROOT);
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

/**
 * 断点目录根：项目已有 build/ 时用 build/readability-loop，否则用 .readability-loop。
 * 首次创建时写入只含 `*` 的 .gitignore，保证断点与日志不进版本控制。
 */
export function loopDir(root) {
  const dir = fs.existsSync(path.join(root, 'build'))
    ? path.join(root, 'build', 'readability-loop')
    : path.join(root, '.readability-loop');
  fs.mkdirSync(dir, { recursive: true });
  const ignore = path.join(dir, '.gitignore');
  if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, '*\n');
  return dir;
}

/**
 * 读取文本文件。内容含 NUL 或大量替换字符时，在 Windows 上改用 `cmd /c type` 再读一次：
 * 透明加密软件（如 SafeNetLOCK）会让非白名单进程读到密文，而 cmd 能拿到明文。
 */
export function readText(file) {
  const text = fs.readFileSync(file, 'utf8');
  const garbled = text.includes('\u0000') || (text.match(/\uFFFD/g) || []).length > 8;
  if (!garbled || !IS_WIN) return text;
  const r = spawnSync('cmd', ['/c', 'type', file], { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 && r.stdout ? r.stdout : text;
}

const exists = (root, ...names) => names.some((n) => fs.existsSync(path.join(root, n)));
const winCmd = (cmd, ...args) => (IS_WIN ? ['cmd', '/c', cmd, ...args] : [cmd, ...args]);

/** Gradle：范围路径向上找到最近的含 build.gradle(.kts) 的目录，作为模块。 */
function gradleModules(root, scope) {
  const mods = new Map();
  for (const s of scope) {
    let dir = path.resolve(root, s);
    if (fs.existsSync(dir) && fs.statSync(dir).isFile()) dir = path.dirname(dir);
    while (dir.startsWith(root)) {
      const buildFile = ['build.gradle.kts', 'build.gradle'].map((b) => path.join(dir, b)).find((f) => fs.existsSync(f));
      if (buildFile) {
        const rel = path.relative(root, dir);
        const gradlePath = rel ? `:${rel.split(path.sep).join(':')}` : '';
        if (!mods.has(gradlePath)) mods.set(gradlePath, { dir, text: readText(buildFile) });
        break;
      }
      if (dir === root) break;
      dir = path.dirname(dir);
    }
  }
  return [...mods.entries()];
}

function detectGradle(root, scope) {
  const tasks = { compile: [], test: [] };
  for (const [gradlePath, { dir, text }] of gradleModules(root, scope)) {
    const android = /com\.android\.(application|library)|\bandroid\s*\{/.test(text);
    const kotlin = /kotlin/i.test(text);
    const compile = android ? (kotlin ? 'compileDebugKotlin' : 'compileDebugJavaWithJavac') : (kotlin ? 'compileKotlin' : 'compileJava');
    tasks.compile.push(`${gradlePath}:${compile}`);
    if (fs.existsSync(path.join(dir, 'src', 'test'))) tasks.test.push(`${gradlePath}:${android ? 'testDebugUnitTest' : 'test'}`);
  }
  const base = exists(root, 'gradlew', 'gradlew.bat') ? (IS_WIN ? ['cmd', '/c', 'gradlew.bat'] : ['./gradlew']) : winCmd('gradle');
  return {
    name: 'Gradle',
    merged: true,
    compile: [...base, ...tasks.compile, '--console=plain'],
    testArgs: tasks.test,
    filterArgs: (f) => ['--tests', f],
    errorLine: /^e: |error:|FAILED|tests completed/,
  };
}

function detectNode(root) {
  const pkg = JSON.parse(readText(path.join(root, 'package.json')));
  const scripts = pkg.scripts || {};
  const pm = exists(root, 'pnpm-lock.yaml') ? 'pnpm' : exists(root, 'yarn.lock') ? 'yarn' : 'npm';
  const compileScript = ['typecheck', 'type-check', 'build', 'compile'].find((s) => scripts[s]);
  const compile = compileScript ? winCmd(pm, 'run', compileScript)
    : exists(root, 'tsconfig.json') ? winCmd('npx', 'tsc', '--noEmit') : null;
  const hasTest = scripts.test && !/no test specified/.test(scripts.test);
  return { name: `Node（${pm}）`, compile, test: hasTest ? winCmd(pm, 'test') : null, filterArgs: (f) => ['--', f], errorLine: /error|failed/i };
}

/**
 * 按项目根目录的标志文件识别构建系统，返回构建与单测命令。
 * merged=true 时单测任务并入构建命令同一次调用（Gradle 避免重复配置开销）；识别不到返回 null。
 */
export function detectBuild(root, scope) {
  if (exists(root, 'gradlew', 'gradlew.bat', 'settings.gradle', 'settings.gradle.kts', 'build.gradle', 'build.gradle.kts')) return detectGradle(root, scope);
  if (exists(root, 'pom.xml')) {
    const mvn = exists(root, 'mvnw', 'mvnw.cmd') ? (IS_WIN ? ['cmd', '/c', 'mvnw.cmd'] : ['./mvnw']) : winCmd('mvn');
    return { name: 'Maven', compile: [...mvn, '-q', 'compile'], test: [...mvn, '-q', 'test'], filterArgs: (f) => [`-Dtest=${f}`], errorLine: /ERROR/ };
  }
  if (exists(root, 'package.json')) return detectNode(root);
  if (exists(root, 'Cargo.toml')) return { name: 'Cargo', compile: ['cargo', 'check', '--all-targets'], test: ['cargo', 'test'], filterArgs: (f) => [f], errorLine: /^error/ };
  if (exists(root, 'go.mod')) return { name: 'Go', compile: ['go', 'build', './...'], test: ['go', 'test', './...'], filterArgs: (f) => ['-run', f], errorLine: /\.go:\d+|FAIL/ };
  const sln = fs.readdirSync(root).find((f) => /\.(sln|csproj)$/.test(f));
  if (sln) return { name: 'dotnet', compile: ['dotnet', 'build', sln], test: ['dotnet', 'test', sln], filterArgs: (f) => ['--filter', f], errorLine: /error/ };
  if (exists(root, 'pyproject.toml', 'setup.py', 'requirements.txt')) {
    const py = IS_WIN ? 'python' : 'python3';
    const test = exists(root, 'tests', 'pytest.ini', 'conftest.py') ? [py, '-m', 'pytest', '-q'] : null;
    return { name: 'Python', compile: [py, '-m', 'compileall', '-q', '{scope}'], test, filterArgs: (f) => ['-k', f], errorLine: /Error/ };
  }
  return null;
}
