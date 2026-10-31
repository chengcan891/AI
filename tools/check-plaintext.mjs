#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const TEXT_EXT = /\.(md|markdown|txt|json|jsonc|ya?ml|js|mjs|cjs|ts|tsx|jsx|py|sh|bat|cmd|ps1|gradle|kts?|java|kt|xml|properties|toml|cfg|ini|env|sql|css|html)$/i;

const KNOWN_HEADERS = [];

const args = process.argv.slice(2);
const wantFingerprint = args.includes('--fingerprint');
const wantAll = args.includes('--all');
const explicit = args.filter(a => !a.startsWith('--'));

function git(argv, opts = {}) {
  const r = spawnSync('git', argv, { maxBuffer: 1 << 28, ...opts });
  if (r.error) throw r.error;
  if (r.status !== 0 && !opts.allowFail) {
    throw new Error('git ' + argv.join(' ') + ' 失败：' + (r.stderr ? r.stderr.toString().slice(0, 300) : ''));
  }
  return r.stdout;
}

function isRepo() {
  const r = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { maxBuffer: 1 << 20 });
  return r.status === 0;
}

function listStaged() {
  return git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
}

function listAll() {
  return git(['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
}

function readStaged(p) {
  return git(['show', ':' + p]);
}

function entropy(buf) {
  const freq = new Uint32Array(256);
  const n = Math.min(buf.length, 65536);
  for (let i = 0; i < n; i++) freq[buf[i]]++;
  let h = 0;
  for (let i = 0; i < 256; i++) {
    if (!freq[i]) continue;
    const p = freq[i] / n;
    h -= p * Math.log2(p);
  }
  return h;
}

function firstBadUtf8(buf) {
  const dec = new TextDecoder('utf-8', { fatal: true });
  try {
    dec.decode(buf);
    return -1;
  } catch {
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] < 0x80) continue;
      const b = buf[i];
      let len = 0;
      if ((b & 0xe0) === 0xc0) len = 2;
      else if ((b & 0xf0) === 0xe0) len = 3;
      else if ((b & 0xf8) === 0xf0) len = 4;
      if (!len) return i;
      try {
        dec.decode(buf.subarray(i, i + len));
        i += len - 1;
      } catch {
        return i;
      }
    }
    return -1;
  }
}

function analyse(buf, name) {
  if (buf.length === 0) return { skip: true, reasons: [] };
  const reasons = [];
  const head = buf.subarray(0, 32).toString('hex');

  for (const h of KNOWN_HEADERS) {
    if (head.startsWith(h.hex)) reasons.push('命中已知加密指纹（' + h.note + '）');
  }

  if (buf.includes(0)) reasons.push('含 0x00 空字节，文本文件不会有');

  const badAt = firstBadUtf8(buf);
  if (badAt >= 0) reasons.push('不是合法 UTF-8，第 ' + badAt + ' 字节附近出错');

  if (badAt < 0) {
    const text = new TextDecoder('utf-8').decode(buf);
    const ctrl = (text.match(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g) || []).length;
    const ratio = ctrl / Math.max(1, text.length);
    if (ratio > 0.01) reasons.push('控制字符占 ' + (ratio * 100).toFixed(1) + '%');
    if (/\.(md|markdown|txt)$/i.test(name) && buf.length > 1024 && !text.includes('\n')) {
      reasons.push('整份没有换行符，不像正常文档');
    }
  }

  const ent = entropy(buf);
  if (ent > 7.4) reasons.push('熵 ' + ent.toFixed(2) + '，超过文本常态（4~6.5）');

  return { skip: false, reasons, head, ent };
}

function main() {
  if (!isRepo()) {
    console.error('当前目录不是 git 仓库，没法检查。请在技能库根目录运行。');
    process.exit(2);
  }

  let items;
  let source;
  if (explicit.length) {
    source = '指定文件';
    items = explicit.map(p => ({ path: p, buf: fs.readFileSync(p) }));
  } else if (wantAll) {
    source = '全部已跟踪文件';
    items = listAll().map(p => ({ path: p, buf: readStaged(p) }));
  } else {
    source = '暂存区';
    items = listStaged().map(p => ({ path: p, buf: readStaged(p) }));
  }

  const textItems = items.filter(i => TEXT_EXT.test(i.path));
  const failed = [];

  console.log('\n检查 ' + textItems.length + ' 个文本文件（来源：' + source + '）\n');

  for (const it of textItems) {
    const a = analyse(it.buf, it.path);
    if (a.skip) continue;
    if (a.reasons.length) {
      failed.push({ path: it.path, reasons: a.reasons, head: a.head, size: it.buf.length });
      console.log('  失败  ' + it.path);
      for (const r of a.reasons) console.log('        · ' + r);
      if (wantFingerprint) console.log('        头 32 字节：' + a.head);
    }
  }

  if (!failed.length) {
    console.log('  全部通过，都是可读文本。\n');
    process.exit(0);
  }

  console.log('\n' + failed.length + ' 个文件没通过。最可能的原因：磁盘加密软件（亿赛通之类）');
  console.log('在非授权进程里读到的是密文，于是提交上去的也是密文，人和 AI 都读不了。\n');
  console.log('怎么修：');
  console.log('  1. 用被加密软件授权的程序（IDE、编辑器）打开该文件，另存到不受保护的目录，再提交');
  console.log('  2. 或者把内容贴到 GitHub 网页上直接提交，不经过本地磁盘');
  console.log('  3. 确认是误报的话，用 --fingerprint 看头 32 字节，回来调整判据\n');
  process.exit(1);
}

try {
  main();
} catch (e) {
  console.error('检查中断：' + (e && e.message ? e.message : e));
  process.exit(3);
}
