#!/usr/bin/env node
/**
 * 可读性守卫：按 readability-loop 技能 rubric.md 中可自动判定的条款检查 Kotlin 源码。
 * 覆盖 R1 文件体量、R3 类说明三段式、R4 方法长度与嵌套、R5 步骤注释、R7 空壳转发、R10 重复状态、R12 高频路径日志、R18 按功能分包。
 * 这是词法级检查，不是编译器 AST；WARN 需要人工判定，FAIL 必须修复或在类说明中写明例外原因。
 * 阈值、高频路径方法名、日志调用模式见 project-detect.mjs 的 CHECKER；范围内没有 .kt 文件时输出 0 个文件并正常退出。
 * 用法（在项目根目录执行）：node <技能目录>/scripts/check-readability.mjs <文件或目录> [更多文件或目录]
 */
import fs from 'node:fs';
import path from 'node:path';
import { CHECKER, findProjectRoot, readText } from './project-detect.mjs';

const ROOT = findProjectRoot();

const MAX_FILE_LINES = CHECKER.maxFileCodeLines;
const MAX_METHOD_LINES = CHECKER.maxMethodLines;
const MAX_NESTING = CHECKER.maxNesting;
const STEP_REQUIRED_STATEMENTS = CHECKER.stepRequiredStatements;
const FORWARDING_CLASS_MAX_CODE_LINES = CHECKER.forwardingClassMaxCodeLines;
const DUPLICATE_STATE_MIN_FILES = CHECKER.duplicateStateMinFiles;
const MAX_PACKAGE_FILES = CHECKER.maxPackageFiles;
const PACKAGE_GROUP_MIN_FILES = CHECKER.packageGroupMinFiles;
const MAIN_SOURCE_DIR = CHECKER.mainSourceDir;

const PER_FRAME_METHOD = CHECKER.hotPathMethod;
const LOG_CALL = CHECKER.logCall;
const STEP_COMMENT = /\/\/\s*步骤\s*(\d+)/;
const CONTINUATION_START = /^(\.|\?\.|\?:|\)|\]|\}|&&|\|\||\+|:|->)/;
const CONTINUATION_END = /(=|,|\(|->|&&|\|\||\+|\?:|\.)$/;
const CLASS_DECL = /^\s*(?:(?:public|private|internal|protected|abstract|open|sealed|data|enum|inner|annotation|value|final)\s+)*(class|object|interface)\s+(\w+)/;

const findings = [];

/** 记录一条检查结果；level 为 FAIL 或 WARN。 */
function report(level, rule, file, line, message) {
  findings.push({ level, rule, file: path.relative(ROOT, file).replace(/\\/g, '/'), line: line + 1, message });
}

/** 收集参数中的 .kt 文件；目录递归展开并跳过 build 产物。 */
function collectFiles(inputs) {
  const files = [];
  const walk = (target) => {
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(target)) {
        if (entry === 'build' || entry === 'node_modules' || entry.startsWith('.')) continue;
        walk(path.join(target, entry));
      }
    } else if (target.endsWith('.kt')) {
      files.push(target);
    }
  };
  for (const input of inputs) {
    const resolved = path.isAbsolute(input) ? input : path.resolve(ROOT, input);
    if (!fs.existsSync(resolved)) {
      console.error(`路径不存在：${input}`);
      process.exit(2);
    }
    walk(resolved);
  }
  return files;
}

/**
 * 把注释和字符串替换为空格（保留换行），便于后续按花括号和括号做结构分析。
 * 同时统计多行原始字符串（通常是 shader）的内部行数，R1 统计时扣除。
 */
function maskSource(text) {
  const out = text.split('');
  const n = text.length;
  let rawInteriorLines = 0;
  const blank = (from, to) => {
    let newlines = 0;
    for (let k = from; k < to && k < n; k++) {
      if (out[k] === '\n') newlines++;
      else out[k] = ' ';
    }
    return newlines;
  };
  let i = 0;
  while (i < n) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '/') {
      const end = text.indexOf('\n', i);
      const e = end < 0 ? n : end;
      blank(i, e);
      i = e;
    } else if (c === '/' && text[i + 1] === '*') {
      // Kotlin 块注释允许嵌套
      let depth = 1;
      let j = i + 2;
      while (j < n && depth > 0) {
        if (text[j] === '/' && text[j + 1] === '*') { depth++; j += 2; }
        else if (text[j] === '*' && text[j + 1] === '/') { depth--; j += 2; }
        else j++;
      }
      blank(i, j);
      i = j;
    } else if (text.startsWith('"""', i)) {
      let j = text.indexOf('"""', i + 3);
      j = j < 0 ? n : j + 3;
      while (text[j] === '"') j++;
      const newlines = blank(i, j);
      if (newlines > 1) rawInteriorLines += newlines - 1;
      i = j;
    } else if (c === '"') {
      let j = i + 1;
      while (j < n && text[j] !== '"' && text[j] !== '\n') {
        if (text[j] === '\\') j += 2;
        else if (text[j] === '$' && text[j + 1] === '{') {
          let depth = 1;
          j += 2;
          while (j < n && depth > 0) {
            if (text[j] === '{') depth++;
            else if (text[j] === '}') depth--;
            j++;
          }
        } else j++;
      }
      blank(i, j + 1);
      i = j + 1;
    } else if (c === '\'' && (text[i + 2] === '\'' || text[i + 1] === '\\')) {
      const end = text.indexOf('\'', i + 2);
      const e = end < 0 ? n : end + 1;
      blank(i, e);
      i = e;
    } else {
      i++;
    }
  }
  return { code: out.join(''), rawInteriorLines };
}

/** 计算每行行首的花括号深度和圆括号深度，以及字符下标到行号的映射。 */
function buildLineIndex(code) {
  const lineStarts = [0];
  const braceAtLine = [0];
  const parenAtLine = [0];
  let brace = 0;
  let paren = 0;
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (c === '{') brace++;
    else if (c === '}') brace--;
    else if (c === '(' || c === '[') paren++;
    else if (c === ')' || c === ']') paren--;
    else if (c === '\n') {
      lineStarts.push(i + 1);
      braceAtLine.push(brace);
      parenAtLine.push(paren);
    }
  }
  const lineOf = (index) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= index) lo = mid; else hi = mid - 1;
    }
    return lo;
  };
  return { braceAtLine, parenAtLine, lineOf };
}

/** 从 open 位置的括号开始找到配对的闭括号下标。 */
function matchClose(code, open, openChar, closeChar) {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === openChar) depth++;
    else if (code[i] === closeChar && --depth === 0) return i;
  }
  return code.length - 1;
}

/** 表达式体方法：从 = 开始找到表达式结束位置（括号平衡且下一行不是续行）。 */
function findExpressionEnd(code, start) {
  let depth = 0;
  for (let i = start; i < code.length; i++) {
    const c = code[i];
    if (c === '(' || c === '{' || c === '[') depth++;
    else if (c === ')' || c === '}' || c === ']') {
      if (depth === 0) return i - 1;
      depth--;
    } else if (c === '\n' && depth === 0) {
      const before = code.slice(start, i).trimEnd();
      // `fun x() =` 换行后才开始写表达式
      if (!before.trim()) continue;
      const rest = code.slice(i + 1);
      const next = rest.match(/^\s*(\S+)/);
      if (CONTINUATION_END.test(before) || (next && CONTINUATION_START.test(next[1]) && !next[1].startsWith('}'))) continue;
      return i;
    }
  }
  return code.length - 1;
}

/** 统计 [fromLine, toLine] 中位于 baseDepth 层的语句起始行。 */
function collectStatementLines(codeLines, index, fromLine, toLine, baseDepth) {
  const statements = [];
  let previous = '';
  for (let l = fromLine; l <= toLine; l++) {
    const trimmed = codeLines[l].trim();
    if (!trimmed) continue;
    const isStart = index.braceAtLine[l] === baseDepth &&
      !CONTINUATION_START.test(trimmed) &&
      !CONTINUATION_END.test(previous);
    if (isStart) statements.push(l);
    previous = trimmed;
  }
  return statements;
}

/** 解析文件中所有带方法体的 fun 声明。 */
function parseFunctions(code, codeLines, index) {
  const functions = [];
  const funRegex = /\bfun\b/g;
  let match;
  while ((match = funRegex.exec(code))) {
    const header = code.slice(match.index + 3, match.index + 400);
    const nameMatch = header.match(/^\s*(?:<[^>]*>\s*)?(?:[\w.<>?, ]+\.)?(\w+)\s*\(/);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    const parenOpen = match.index + 3 + nameMatch[0].length - 1;
    const parenClose = matchClose(code, parenOpen, '(', ')');
    const declLine = index.lineOf(match.index);
    const declText = codeLines[declLine];
    let bodyKind = null;
    let k = parenClose + 1;
    for (; k < code.length; k++) {
      const c = code[k];
      if (c === '{') { bodyKind = 'block'; break; }
      if (c === '=' && code[k + 1] !== '=' && !'!<>='.includes(code[k - 1])) { bodyKind = 'expr'; break; }
      if (c === '}') break;
      if (c === '\n') {
        const next = code.slice(k + 1).match(/^\s*(\S)/);
        if (!next || !'{=:'.includes(next[1])) break;
      }
    }
    if (!bodyKind) continue;
    const fn = {
      name,
      declLine,
      isPrivate: /\bprivate\b/.test(declText.slice(0, declText.indexOf('fun'))),
      isOverride: /\boverride\b/.test(declText),
      hasLambda: false,
    };
    if (bodyKind === 'block') {
      const close = matchClose(code, k, '{', '}');
      fn.bodyStartLine = index.lineOf(k);
      fn.endLine = index.lineOf(close);
      fn.baseDepth = index.braceAtLine[fn.bodyStartLine] + 1;
      fn.statements = collectStatementLines(codeLines, index, fn.bodyStartLine + 1, fn.endLine - 1, fn.baseDepth);
      fn.bodyCode = code.slice(k + 1, close);
    } else {
      const end = findExpressionEnd(code, k + 1);
      const exprStart = k + 1 + (code.slice(k + 1).match(/^\s*/)[0].length);
      fn.bodyStartLine = index.lineOf(exprStart);
      fn.endLine = index.lineOf(end);
      fn.bodyCode = code.slice(k + 1, end);
      const firstLine = codeLines[fn.bodyStartLine];
      if (/\{\s*([\w, ]+->)?$/.test(firstLine.trimEnd())) {
        // with(work) { ... } / also { ... } 这类表达式体，按 lambda 内部语句计算
        fn.hasLambda = true;
        fn.baseDepth = index.braceAtLine[fn.bodyStartLine] + 1;
        fn.statements = collectStatementLines(codeLines, index, fn.bodyStartLine + 1, fn.endLine - 1, fn.baseDepth);
      } else {
        fn.hasLambda = fn.bodyCode.includes('{');
        fn.baseDepth = index.braceAtLine[fn.bodyStartLine];
        fn.statements = [fn.bodyStartLine];
      }
    }
    functions.push(fn);
  }
  return functions;
}

/** 读取声明行上方的 KDoc 文本；没有则返回空串。 */
function kdocAbove(origLines, declLine) {
  let l = declLine - 1;
  while (l >= 0 && (origLines[l].trim().startsWith('@') || origLines[l].trim() === '')) l--;
  if (l < 0 || !origLines[l].trim().endsWith('*/')) return '';
  const end = l;
  while (l >= 0 && !origLines[l].includes('/**')) l--;
  return l < 0 ? '' : origLines.slice(l, end + 1).join('\n');
}

/** 找出顶层类型声明，并统计每个类型内部声明的方法数量。 */
function collectClasses(codeLines, index, functions) {
  const classes = [];
  codeLines.forEach((line, l) => {
    if (index.braceAtLine[l] !== 0) return;
    const m = line.match(CLASS_DECL);
    if (m) classes.push({ kind: m[1], name: m[2], line: l, isData: /\b(data|enum|annotation)\b/.test(line) });
  });
  classes.forEach((c, i) => {
    const nextLine = i + 1 < classes.length ? classes[i + 1].line : Infinity;
    c.functionCount = functions.filter((f) => f.declLine > c.line && f.declLine < nextLine && index.braceAtLine[f.declLine] >= 1).length;
  });
  return classes;
}

/** R3：有方法的顶层类必须包含“职责/不负责/使用步骤”三段说明；纯数据类只需一句说明。 */
function checkClassDocs(file, origLines, classes) {
  for (const c of classes) {
    const doc = kdocAbove(origLines, c.line);
    if (c.functionCount === 0) {
      if (!doc) report('FAIL', 'R3', file, c.line, `${c.kind} ${c.name} 缺少类说明（纯数据类只需一句话说明用途）`);
      continue;
    }
    const missing = ['职责', '不负责', '使用步骤'].filter((label) => !new RegExp(`${label}[：:]`).test(doc));
    if (missing.length) report('FAIL', 'R3', file, c.line, `${c.kind} ${c.name} 类说明缺少：${missing.join('、')}`);
  }
}

/** R4/R5/R7/R12：逐个方法检查长度、嵌套、步骤注释、空壳转发与每帧日志。 */
function checkFunctions(file, origLines, codeLines, index, code, functions) {
  for (const fn of functions) {
    const length = fn.endLine - fn.declLine + 1;
    if (length > MAX_METHOD_LINES) {
      report('FAIL', 'R4', file, fn.declLine, `方法 ${fn.name} 共 ${length} 行，超过 ${MAX_METHOD_LINES} 行`);
    }
    let maxDepth = 0;
    for (let l = fn.bodyStartLine + 1; l <= fn.endLine; l++) {
      if (codeLines[l].trim()) maxDepth = Math.max(maxDepth, index.braceAtLine[l] - fn.baseDepth);
    }
    if (maxDepth > MAX_NESTING) {
      report('WARN', 'R4', file, fn.declLine, `方法 ${fn.name} 花括号嵌套 ${maxDepth} 层（含 lambda），超过 ${MAX_NESTING} 层`);
    }

    const steps = [];
    for (let l = fn.bodyStartLine; l <= fn.endLine; l++) {
      const m = origLines[l].match(STEP_COMMENT);
      if (m) steps.push({ number: Number(m[1]), line: l });
    }
    if (fn.statements.length >= STEP_REQUIRED_STATEMENTS && steps.length === 0) {
      report('FAIL', 'R5', file, fn.declLine, `方法 ${fn.name} 有 ${fn.statements.length} 条语句，但没有 // 步骤N 注释`);
    }
    if (steps.length) {
      const broken = steps.findIndex((s, i) => s.number !== i + 1);
      if (broken >= 0) {
        report('FAIL', 'R5', file, steps[broken].line, `方法 ${fn.name} 步骤编号不连续：期望 ${broken + 1}，实际 ${steps[broken].number}`);
      }
      if (fn.statements.length >= STEP_REQUIRED_STATEMENTS && fn.statements[0] < steps[0].line) {
        report('WARN', 'R5', file, fn.statements[0], `方法 ${fn.name} 第一条语句前没有步骤注释`);
      }
    }

    if (fn.isPrivate && !fn.isOverride && fn.statements.length === 1 && !fn.hasLambda &&
      !/\b(try|synchronized|if|when)\b/.test(fn.bodyCode)) {
      const uses = (code.match(new RegExp(`(\\b${fn.name}\\s*\\(|::${fn.name}\\b)`, 'g')) || []).length - 1;
      if (uses === 1) {
        report('FAIL', 'R7', file, fn.declLine, `私有方法 ${fn.name} 只有一条语句且只被调用 1 次，属于空壳转发，应内联到调用处并用步骤注释说明`);
      } else if (uses === 0) {
        report('WARN', 'R14', file, fn.declLine, `私有方法 ${fn.name} 在本文件内未找到调用，可能是无用方法（删除前需全仓库引用搜索）`);
      }
    }

    if (PER_FRAME_METHOD.test(fn.name)) {
      for (let l = fn.bodyStartLine + 1; l <= fn.endLine; l++) {
        const line = codeLines[l];
        if (!LOG_CALL.test(line)) continue;
        const trimmed = line.trim();
        const conditional = index.braceAtLine[l] > fn.baseDepth || /^(if|else|when)\b/.test(trimmed) || /\?\.let|takeIf/.test(line);
        if (!conditional) {
          report('FAIL', 'R12', file, l, `高频路径方法 ${fn.name} 中存在无条件日志，需改为限频、状态变化时或异常分支输出`);
        }
      }
    }
  }
}

/** R7 补充：体量很小、对外方法很少的类可能是转发类，提示人工判定。 */
function checkForwardingClass(file, codeLines, classes, functions) {
  const named = classes.filter((c) => c.kind === 'class' && !c.isData && c.functionCount > 0);
  if (named.length !== 1) return;
  const codeLineCount = codeLines.filter((l) => l.trim() && !/^\s*(import|package)\b/.test(l)).length;
  const publicFuns = functions.filter((f) => !f.isPrivate && !f.isOverride);
  if (codeLineCount < FORWARDING_CLASS_MAX_CODE_LINES && publicFuns.length <= 2) {
    report('WARN', 'R7', file, named[0].line,
      `类 ${named[0].name} 只有 ${codeLineCount} 行代码、${publicFuns.length} 个对外方法，可能是转发类，需判定是否合并回调用方`);
  }
}

/**
 * R16：成员属性（构造参数属性、类体字段、伴生对象常量）必须有紧邻 KDoc 或行尾说明。
 * 只检查函数体之外的声明：花括号深度 ≤ 1 的 val/var，以及深度 2 的 const val；
 * 是否只是把变量名翻译成中文由人工判定。
 */
function checkMemberDocs(file, origLines, codeLines, index, functions) {
  const insideFunction = (l) => functions.some((f) => l > f.declLine && l <= f.endLine);
  const PROPERTY_DECL = /^\s*(?:@\w+(?:\([^)]*\))?\s+)*(?:(?:private|internal|protected|public|override|open|lateinit|const|final)\s+)*(val|var)\s+(\w+)/;
  codeLines.forEach((line, l) => {
    const depth = index.braceAtLine[l];
    const m = line.match(PROPERTY_DECL);
    if (!m || insideFunction(l)) return;
    const isConst = /\bconst\s+val\b/.test(line);
    if (depth > 1 && !(depth === 2 && isConst)) return;
    const hasTrailingDoc = /\/\/|\/\*\*/.test(origLines[l].slice(origLines[l].indexOf(m[2])));
    const hasPropertyTag = depth === 0 && new RegExp(`@(property|param)\\s+${m[2]}\\b`).test(origLines.join('\n'));
    if (!kdocAbove(origLines, l) && !hasTrailingDoc && !hasPropertyTag) {
      report('FAIL', 'R16', file, l, `成员 ${m[2]} 缺少说明（写清存什么、谁写谁读、生命周期）`);
    }
  });
}

/** 收集类成员 var 名称，供 R10 跨文件重复状态检查。 */
function collectMemberVars(file, codeLines, index, stateOwners) {
  codeLines.forEach((line, l) => {
    if (index.braceAtLine[l] !== 1) return;
    const m = line.match(/^\s*(?:(?:private|internal|protected)\s+)?var\s+(\w+)/);
    if (!m) return;
    if (!stateOwners.has(m[1])) stateOwners.set(m[1], []);
    stateOwners.get(m[1]).push({ file, line: l });
  });
}

function checkFile(file, stateOwners) {
  const text = readText(file).replace(/\r\n/g, '\n');
  const origLines = text.split('\n');
  const { code, rawInteriorLines } = maskSource(text);
  const codeLines = code.split('\n');
  const index = buildLineIndex(code);

  // R1 只统计代码行：注释、KDoc、空行和多行原始字符串（shader）内部行都已在 maskSource 中置空。
  const physical = origLines.length - (text.endsWith('\n') ? 1 : 0);
  const codeLineCount = codeLines.filter((l) => l.trim()).length;
  if (codeLineCount > MAX_FILE_LINES) {
    const shaderNote = rawInteriorLines ? `，已扣除原始字符串 ${rawInteriorLines} 行` : '';
    report('FAIL', 'R1', file, 0, `文件代码行 ${codeLineCount} 行（物理行 ${physical}${shaderNote}），超过 ${MAX_FILE_LINES} 行`);
  }

  const functions = parseFunctions(code, codeLines, index);
  const classes = collectClasses(codeLines, index, functions);
  checkClassDocs(file, origLines, classes);
  checkFunctions(file, origLines, codeLines, index, code, functions);
  checkForwardingClass(file, codeLines, classes, functions);
  checkMemberDocs(file, origLines, codeLines, index, functions);
  collectMemberVars(file, codeLines, index, stateOwners);
}

/** 按驼峰拆出类名单词，跳过与包名相同的单词（如 ribbon 包下的 Ribbon 前缀不构成功能分组）。 */
function featureWords(fileName, packageName) {
  const words = path.basename(fileName, '.kt').match(/[A-Z][a-z0-9]*/g) || [];
  return words.filter((w) => w.toLowerCase() !== packageName.toLowerCase());
}

/**
 * R18：检查被检查文件所在的每个主源码包（只统计包目录下直接存放的 .kt 文件，不含子包）。
 * 包内文件过多，或同首词/同尾词的类达到分组阈值时给出 WARN 与分组建议，是否分包由人工判定。
 */
function checkPackageLayout(files) {
  const packageDirs = new Set(files.map((f) => path.dirname(f)).filter((d) => MAIN_SOURCE_DIR.test(d)));
  for (const dir of packageDirs) {
    const packageName = path.basename(dir);
    const ktFiles = fs.readdirSync(dir).filter((e) => e.endsWith('.kt') && fs.statSync(path.join(dir, e)).isFile());
    if (ktFiles.length > MAX_PACKAGE_FILES) {
      report('WARN', 'R18', dir, -1, `包 ${packageName} 直接存放 ${ktFiles.length} 个 .kt 文件，超过 ${MAX_PACKAGE_FILES} 个，评估按功能分子包`);
    }
    const groups = new Map();
    for (const file of ktFiles) {
      const words = featureWords(file, packageName);
      if (!words.length) continue;
      const keys = new Set([`${words[0]}*`, `*${words[words.length - 1]}`]);
      for (const key of keys) {
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(path.basename(file, '.kt'));
      }
    }
    for (const [key, members] of groups) {
      if (members.length >= PACKAGE_GROUP_MIN_FILES && members.length < ktFiles.length) {
        report('WARN', 'R18', dir, -1, `包 ${packageName} 中 ${key} 一组 ${members.length} 个类（${members.join('、')}），评估是否归入同一子包`);
      }
    }
  }
}

function main() {
  const inputs = process.argv.slice(2);
  if (!inputs.length) {
    console.error('用法：node <技能目录>/scripts/check-readability.mjs <文件或目录> [更多文件或目录]');
    process.exit(2);
  }
  const files = collectFiles(inputs);
  const stateOwners = new Map();
  for (const file of files) checkFile(file, stateOwners);
  checkPackageLayout(files);

  for (const [name, owners] of stateOwners) {
    const distinctFiles = new Set(owners.map((o) => o.file));
    if (distinctFiles.size >= DUPLICATE_STATE_MIN_FILES) {
      const where = [...distinctFiles].map((f) => path.basename(f)).join('、');
      report('WARN', 'R10', owners[0].file, owners[0].line, `状态 ${name} 在 ${distinctFiles.size} 个文件中各存一份（${where}），确认是否应只由一个类持有`);
    }
  }

  findings.sort((a, b) => (a.level === b.level ? 0 : a.level === 'FAIL' ? -1 : 1) || a.file.localeCompare(b.file) || a.line - b.line);
  for (const f of findings) console.log(`${f.level.padEnd(4)} ${f.rule.padEnd(3)} ${f.file}:${f.line}  ${f.message}`);
  const fails = findings.filter((f) => f.level === 'FAIL').length;
  const warns = findings.length - fails;
  console.log(`\n检查 ${files.length} 个文件：FAIL ${fails}，WARN ${warns}`);
  process.exit(fails ? 1 : 0);
}

main();
