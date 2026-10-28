#!/usr/bin/env node
/**
 * 可读性重构循环的一次性验证：把每轮要跑的编译、单测、可读性检查、项目守卫合并为一次调用，
 * 完整日志写入 <断点目录>/<类名>/，只在标准输出打印不超过 20 行的摘要。
 *
 * 用法（在项目根目录执行）：
 *   node <技能目录>/scripts/readability-verify.mjs --name <类名> --round <N> [选项] -- <范围文件或目录...>
 *   node <技能目录>/scripts/readability-verify.mjs --name <类名> --round <N> --batch <K> --compile-only -- <范围文件或目录...>
 *   node <技能目录>/scripts/readability-verify.mjs --name <类名> --stale-check -- <范围文件或目录...>
 *
 * 选项：
 *   --skip-test          只编译不跑单测（仅限本轮只改了注释/文档注释/日志文案）
 *   --tests <过滤>       单测过滤（Gradle 的 --tests、Maven 的 -Dtest 等，按识别到的构建系统转换）
 *   --task <参数>        追加给自动识别的构建命令的参数，可重复（例如 Gradle 任务 :app:compileDebugKotlin）
 *   --build "<命令>"     覆盖自动识别的构建命令（整条命令经 shell 执行）
 *   --test "<命令>"      覆盖自动识别的单测命令（整条命令经 shell 执行）
 *   --guard "<命令>"     追加一个项目守卫命令，可重复；项目规则要求的守卫由调度者传入
 *   --skip-guard         不运行 --guard 指定的守卫（本轮不涉及守卫所保护的对象）
 *   --stale-check        不运行任何命令，只判断最近一次摘要是否晚于范围文件的最后修改时间
 *   --compile-only       批内编译检查：只编译，不跑单测、check-readability 和守卫；必须同时给 --batch，
 *                        结果写 r<N>-b<K>-compile.txt，不是校验摘要，不能代替本轮完整验证
 *   --batch <K>          分批编号，与 --compile-only 一起使用
 *
 * 构建系统按项目根目录标志文件自动识别（Gradle / Maven / Node / Cargo / Go / dotnet / Python，见 project-detect.mjs）；
 * 识别不到且未传 --build 时记为“未识别、已跳过”，不算失败。
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE_EXTENSIONS, detectBuild, findProjectRoot, loopDir } from './project-detect.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = findProjectRoot();
const SUMMARY_PREFIX = 'verify-summary';

function parseArgs(argv) {
  const opts = { tasks: [], guards: [], scope: [], skipTest: false, skipGuard: false, staleCheck: false, compileOnly: false };
  const sep = argv.indexOf('--');
  const head = sep >= 0 ? argv.slice(0, sep) : argv;
  opts.scope = sep >= 0 ? argv.slice(sep + 1) : [];
  for (let i = 0; i < head.length; i++) {
    const a = head[i];
    if (a === '--name') opts.name = head[++i];
    else if (a === '--round') opts.round = head[++i];
    else if (a === '--tests') opts.tests = head[++i];
    else if (a === '--task') opts.tasks.push(head[++i]);
    else if (a === '--build') opts.build = head[++i];
    else if (a === '--test') opts.test = head[++i];
    else if (a === '--guard') opts.guards.push(head[++i]);
    else if (a === '--skip-test') opts.skipTest = true;
    else if (a === '--skip-guard') opts.skipGuard = true;
    else if (a === '--stale-check') opts.staleCheck = true;
    else if (a === '--compile-only') opts.compileOnly = true;
    else if (a === '--batch') opts.batch = head[++i];
  }
  if (!opts.name || !opts.scope.length || (!opts.staleCheck && !opts.round) || (opts.compileOnly && !opts.batch)) {
    console.error('用法：node <技能目录>/scripts/readability-verify.mjs --name <类名> --round <N> [--batch <K> --compile-only] [选项] -- <范围文件或目录...>');
    process.exit(2);
  }
  if (opts.compileOnly) opts.skipTest = true;
  return opts;
}

/** 递归收集范围内的源码文件，返回绝对路径；跳过 build 产物与隐藏目录。 */
function collectSources(scope) {
  const out = [];
  const walk = (p) => {
    if (!fs.existsSync(p)) return;
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      for (const e of fs.readdirSync(p)) if (e !== 'build' && e !== 'node_modules' && !e.startsWith('.')) walk(path.join(p, e));
    } else if (SOURCE_EXTENSIONS.some((ext) => p.endsWith(ext))) out.push(p);
  };
  for (const s of scope) walk(path.resolve(ROOT, s));
  return out;
}

function latestSource(files) {
  let latest = { file: '', mtime: 0 };
  for (const f of files) {
    const m = fs.statSync(f).mtimeMs;
    if (m > latest.mtime) latest = { file: path.relative(ROOT, f), mtime: m };
  }
  return latest;
}

/** 运行命令并把 stdout+stderr 写入日志。command 为字符串时经 shell 执行；数组首项为 "node" 时换成当前 Node。 */
function run(command, logFile) {
  const start = Date.now();
  const r = typeof command === 'string'
    ? spawnSync(command, { cwd: ROOT, maxBuffer: 256 * 1024 * 1024, shell: true })
    : spawnSync(command[0] === 'node' ? process.execPath : command[0], command.slice(1), { cwd: ROOT, maxBuffer: 256 * 1024 * 1024, shell: false });
  const text = Buffer.concat([r.stdout ?? Buffer.alloc(0), r.stderr ?? Buffer.alloc(0), Buffer.from(r.error ? String(r.error) : '')]);
  fs.writeFileSync(logFile, text);
  return { code: r.status ?? 1, text: text.toString('utf8'), seconds: Math.round((Date.now() - start) / 1000) };
}

function fmt(ms) {
  return new Date(ms).toLocaleString('zh-CN', { hour12: false });
}

/** 找到目录下最新的摘要文件，用于 --stale-check。 */
function latestSummary(outDir) {
  const files = fs.readdirSync(outDir).filter((f) => f.includes(SUMMARY_PREFIX));
  if (!files.length) return null;
  return files.map((f) => ({ f, m: fs.statSync(path.join(outDir, f)).mtimeMs })).sort((a, b) => b.m - a.m)[0];
}

function staleCheck(outDir, latest) {
  const s = latestSummary(outDir);
  if (!s) {
    console.log('stale-check：没有摘要文件，需要运行验证');
    process.exit(1);
  }
  const allOk = /^结果：全部通过/m.test(fs.readFileSync(path.join(outDir, s.f), 'utf8'));
  const fresh = s.m >= latest.mtime;
  console.log(`stale-check：摘要 ${s.f}（${fmt(s.m)}）；范围最后修改 ${latest.file}（${fmt(latest.mtime)}）`);
  console.log(`stale-check：${fresh ? '日志晚于源码，可复用' : '源码在摘要之后有修改，需要重跑'}；摘要结果：${allOk ? '全部通过' : '存在失败'}`);
  process.exit(fresh && allOk ? 0 : 1);
}

/** 把运行结果里的错误行（最多 8 行）追加到摘要。 */
function pushErrors(lines, text, pattern) {
  if (!pattern) return;
  for (const e of text.split(/\r?\n/).filter((l) => pattern.test(l)).slice(0, 8)) lines.push(`  ${e.trim()}`);
}

/**
 * 构建与单测。优先用 --build/--test 覆盖；否则按自动识别结果执行，
 * merged 构建系统（Gradle）把单测任务并入同一次调用。返回本步骤是否通过。
 */
function runBuildAndTest(opts, outDir, prefix, lines) {
  const detected = opts.build ? null : detectBuild(ROOT, opts.scope);
  const buildCommand = opts.build ?? (detected?.compile ? [...detected.compile, ...opts.tasks] : null);
  const merged = !opts.build && detected?.merged && !opts.skipTest && !opts.test;
  let ok = true;

  // 步骤1：构建（merged 时同一次调用带上单测任务与过滤参数）
  if (!buildCommand) {
    lines.push(`构建：未识别构建系统，已跳过（需要编译证据时用 --build "<命令>" 指定）`);
  } else {
    let command = buildCommand;
    if (Array.isArray(command)) {
      command = command.flatMap((a) => (a === '{scope}' ? opts.scope : [a]));
      if (merged) command = [...command, ...detected.testArgs, ...(opts.tests && detected.testArgs.length ? detected.filterArgs(opts.tests) : [])];
    }
    const r = run(command, path.join(outDir, `${prefix}build.txt`));
    ok = r.code === 0;
    const label = opts.build ? '自定义' : detected.name;
    lines.push(`构建（${label}）${merged ? '+单测' : ''}：${ok ? '通过' : '失败'}，用时 ${r.seconds}s；${Array.isArray(command) ? command.join(' ') : command}`);
    if (!ok) pushErrors(lines, r.text, detected?.errorLine ?? /error|FAILED/i);
  }

  // 步骤2：单测（merged 已在构建中执行；识别不到单测命令时记为跳过）
  if (opts.compileOnly) {
    lines.push('单测：批内编译检查不跑单测');
  } else if (opts.skipTest) {
    lines.push('单测：已跳过（--skip-test，仅限只改注释/文档注释/日志文案的轮次）');
  } else if (!merged) {
    const testCommand = opts.test ?? (detected?.test ? [...detected.test, ...(opts.tests ? detected.filterArgs(opts.tests) : [])] : null);
    if (!testCommand) {
      lines.push('单测：未识别单测命令，已跳过');
    } else {
      const tr = run(testCommand, path.join(outDir, `${prefix}test.txt`));
      lines.push(`单测：${tr.code === 0 ? '通过' : '失败'}，用时 ${tr.seconds}s`);
      if (tr.code !== 0) pushErrors(lines, tr.text, detected?.errorLine ?? /error|FAILED/i);
      ok &&= tr.code === 0;
    }
  } else if (!detected.testArgs.length) {
    lines.push('单测：范围所在模块没有 src/test，已跳过');
  }
  return ok;
}

/**
 * 批内编译检查：结构批次结束时只确认能编译，避免多批改动的编译错误叠加到最后一批才暴露。
 * 结果文件名不含 verify-summary，stale-check 与调度者的阶段判断都不会把它当成校验摘要。
 */
function compileCheck(opts, outDir, sourceCount) {
  const prefix = `r${opts.round}-b${opts.batch}-`;
  const lines = [`第 ${opts.round} 轮第 ${opts.batch} 批编译检查：${opts.name}（范围 ${sourceCount} 个源码文件）`];
  const ok = runBuildAndTest(opts, outDir, prefix, lines);
  lines.push(`完成：${fmt(Date.now())}；日志 ${path.relative(ROOT, outDir).replace(/\\/g, '/')}/${prefix}build.txt`);
  lines.push(ok ? '结果：编译通过' : '结果：编译失败（看 build 日志）');
  fs.writeFileSync(path.join(outDir, `${prefix}compile.txt`), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  process.exit(ok ? 0 : 1);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const outDir = path.join(loopDir(ROOT), opts.name);
  fs.mkdirSync(outDir, { recursive: true });
  const sources = collectSources(opts.scope);
  const latest = latestSource(sources);
  if (opts.staleCheck) return staleCheck(outDir, latest);

  if (opts.compileOnly) return compileCheck(opts, outDir, sources.length);

  const prefix = `r${opts.round}-`;
  const lines = [`第 ${opts.round} 轮验证：${opts.name}（范围 ${sources.length} 个源码文件）`];

  // 步骤1：构建与单测（能合并时一次调用跑完）
  let ok = runBuildAndTest(opts, outDir, prefix, lines);

  // 步骤2：可读性检查脚本，摘要只保留最后的计数行
  const readability = run(['node', path.join(SCRIPT_DIR, 'check-readability.mjs'), ...opts.scope], path.join(outDir, `${prefix}check-readability.txt`));
  ok &&= readability.code === 0;
  lines.push(`check-readability：${(readability.text.trim().split(/\r?\n/).pop() ?? '').trim()}`);

  // 步骤3：项目守卫（由调度者按项目规则用 --guard 传入；本轮不涉及守卫对象时用 --skip-guard 跳过）
  opts.guards.forEach((g, i) => {
    if (opts.skipGuard) {
      lines.push(`守卫 ${g}：已跳过（--skip-guard）`);
      return;
    }
    const gr = run(g, path.join(outDir, `${prefix}guard-${i + 1}.txt`));
    ok &&= gr.code === 0;
    lines.push(`守卫 ${g}：${gr.code === 0 ? 'OK' : `失败（退出码 ${gr.code}）`}`);
  });

  // 步骤4：写摘要，记录源码最后修改时间，供验收方判断日志能否复用
  lines.push(`范围最后修改：${latest.file}（${fmt(latest.mtime)}）`);
  lines.push(`验证完成：${fmt(Date.now())}；日志目录 ${path.relative(ROOT, outDir).replace(/\\/g, '/')}/${prefix}*.txt`);
  lines.push(ok ? '结果：全部通过' : '结果：存在失败（看对应日志）');
  fs.writeFileSync(path.join(outDir, `${prefix}${SUMMARY_PREFIX}.txt`), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  process.exit(ok ? 0 : 1);
}

main();
