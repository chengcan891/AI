#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TEXT_EXT = /\.(md|markdown|txt|json|jsonc|ya?ml|js|mjs|cjs|ts|tsx|jsx|py|sh|bat|cmd|ps1|gradle|kts?|java|kt|xml|properties|toml|cfg|ini|env|sql|css|html)$/i;

const KNOWN_HEADERS = [
  { hex: '62142365', needle: 'E-SafeNet', note: '亿赛通（E-SafeNet）' }
];

const args = process.argv.slice(2);
const wantFingerprint = args.includes('--fingerprint');
const wantAll = args.includes('--all');
const dirIdx = args.indexOf('--dir');
const dirArg = dirIdx >= 0 ? args[dirIdx + 1] : null;
const explicit = args.filter((a, i) => !a.startsWith('--') && !(dirIdx >= 0 && i === dirIdx + 1));

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

function showStaged(p) {
  return git(['show', ':' + p]);
}

function walk(root, out = []) {
  let entries;
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === '.gradle' || e.name === 'build') continue;
    const full = path.join(root, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile()) out.push(full);
  }
  return out;
}

function entropy(buf) {
  const freq = new Uint32Array(256);
  const n = Math.min(buf.length, 65536);
  if (!n) return 0;
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
  try { dec.decode(buf); return -1; } catch {}
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] < 0x80) continue;
    const b = buf[i];
    let len = 0;
    if ((b & 0xe0) === 0xc0) len = 2;
    else if ((b & 0xf0) === 0xe0) len = 3;
    else if ((b & 0xf8) === 0xf0) len = 4;
    if (!len) return i;
    try { dec.decode(buf.subarray(i, i + len)); i += len - 1; } catch { return i; }
  }
  return -1;
}

function analyse(buf, name) {
  if (buf.length === 0) return { skip: true, reasons: [], fingerprint: null };
  const reasons = [];
  const head32 = buf.subarray(0, 32);
  const headHex = head32.toString('hex');
  let fingerprint = null;

  for (const k of KNOWN_HEADERS) {
    const byHex = k.hex && headHex.startsWith(k.hex);
    const byNeedle = k.needle && buf.subarray(0, 64).includes(k.needle);
    if (byHex && byNeedle) {
      fingerprint = k.note;
      reasons.push('命中已知加密指纹：' + k.note);
    }
  }

  if (buf.includes(0)) reasons.push('含 0x00 空字节，文本文件不会有');

  const badAt = firstBadUtf8(buf);
  if (badAt >= 0 && !fingerprint) reasons.push('不是合法 UTF-8，第 ' + badAt + ' 字节附近出错');

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
  if (ent > 7.4 && !fingerprint) reasons.push('熵 ' + ent.toFixed(2) + '，超过文本常态（4~6.5）');

  return { skip: false, reasons, fingerprint, headHex };
}

function main() {
  let items = [];
  let source = '';

  if (dirArg) {
    source = '目录 ' + dirArg;
    const files = walk(dirArg).filter(f => TEXT_EXT.test(f));
    items = files.map(f => ({ path: f, buf: fs.readFileSync(f) }));
  } else if (explicit.length) {
    source = '指定文件';
    items = explicit.map(p => ({ path: p, buf: fs.readFileSync(p) }));
  } else {
    if (!isRepo()) {
      console.error('当前目录不是 git 仓库。要么在仓库里跑，要么用 --dir <目录> 指定要扫的目录。');
      process.exit(2);
    }
    if (wantAll) {
      source = '全部已跟踪文件';
      items = listAll().map(p => ({ path: p, buf: showStaged(p) }));
    } else {
      source = '暂存区';
      items = listStaged().map(p => ({ path: p, buf: showStaged(p) }));
    }
  }

  const textItems = dirArg || explicit.length ? items : items.filter(i => TEXT_EXT.test(i.path));
  const failed = [];
  let fingerprinted = 0;

  console.log('\n检查 ' + textItems.length + ' 个文本文件（来源：' + source + '）\n');

  for (const it of textItems) {
    const a = analyse(it.buf, it.path);
    if (a.skip) continue;
    if (!a.reasons.length) continue;
    if (a.fingerprint) fingerprinted++;
    failed.push({ path: it.path, reasons: a.reasons, head: a.headHex, size: it.buf.length });
    console.log('  失败  ' + it.path);
    for (const r of a.reasons) console.log('        · ' + r);
    if (wantFingerprint || a.fingerprint) console.log('        头 32 字节：' + a.headHex);
  }

  if (!failed.length) {
    console.log('  全部通过，都是可读文本。\n');
    process.exit(0);
  }

  console.log('\n' + failed.length + ' 个文件没通过，' +
    (fingerprinted ? '其中 ' + fingerprinted + ' 个确认是亿赛通加密文件。' : '内容不是可读文本。'));
  console.log('加密文件里存的是密文，没有残留明文，换任何工具都读不出来，提交上去就是一堆废字节。\n');
  console.log('怎么修：');
  console.log('  1. 在装了亿赛通客户端的电脑上，用被授权的程序（IDE、编辑器）打开，另存到不受保护的目录');
  console.log('  2. 或者把内容贴到 GitHub 网页上直接提交，不经过本地磁盘');
  console.log('  3. 微信、QQ 收到的 .kt/.md 大概率是密文，别直接往仓库里拷\n');
  process.exit(1);
}

try {
  main();
} catch (e) {
  console.error('检查中断：' + (e && e.message ? e.message : e));
  process.exit(3);
}
