# AI 技能库

可执行的 SKILL.md 集合，给 Cursor / Codex / WorkBuddy 这类工具用。

```
skills/                          技能本体
.github/workflows/text-guard.yml 云端明文检查
README.md                        本文件
```

## 明文检查

这个仓库可能从一台做了磁盘透明加密（亿赛通）的机器上提交。未被授权的进程读到的是密文，那样推上去的 Markdown 在 GitHub 上是乱码，AI 读不了，人也读不了。

所以提交前有一道检查。**它不在这个仓库里，这是故意的。**

### 为什么不能放在仓库里

第一版放在 `tools/check-plaintext.mjs`，钩子调这个脚本。实测下来是错的：把脚本自己换成密文再提交，钩子确实拒绝了提交（fail-closed，方向没错），但打印的是——

```
提交已取消：暂存区里有不是可读文本的文件
```

**坏掉的是检测器，它却在指控你的文件。** 你会去翻文件、查不出问题，最后 `git commit --no-verify` 绕过。一次误诊就足以让人不再信任这个钩子。

检测器不能住在被检测的区域里。所以它搬到 `~/.git-hooks/`：

- 不会被 `git pull`、`git checkout` 覆盖
- 不随仓库内容更新而漂移
- 仓库目录被加密时，不受牵连

### 脚本放在哪：三处，各管一段

| 位置 | 谁在跑 | 管什么 | 会怎么失效 |
|---|---|---|---|
| `~/.git-hooks/pre-commit` | 本机每次 `git commit` | 你手动提交 | `--no-verify`、配置丢失、钩子被加密 |
| `.github/workflows/text-guard.yml` | GitHub 的机器，每次 push | 所有人，包括绕过钩子的 | 关掉 workflow |
| 随时敲 `--all` / `--dir` | 本机 | 补检查 | 忘了敲 |

**三层不能互相替代。** 本地那层快，能当场拦住；云端那层是底线。

有一个事实要说清楚：**通过 API 直接提交（不经过 `git commit`）时，本地钩子完全不参与**。工具替你写仓库走的就是这条路，它绕得过钩子，绕不过云端。所以云端不是"备份"，是唯一能管住所有提交方式的那一层。

### 装法

```bash
mkdir -p ~/.git-hooks
# 把本文件末尾的源码存成 ~/.git-hooks/pre-commit
chmod +x ~/.git-hooks/pre-commit
git config --global core.hooksPath ~/.git-hooks
```

`core.hooksPath` 要写绝对路径或由 shell 展开的 `~`，**别在引号里写 `~`**——git 不展开它，配了等于没配。

### 装完必须自查

```bash
~/.git-hooks/pre-commit --doctor
```

正常输出：

```
钩子文件    明文  6617B  C:\Users\你\.git-hooks\pre-commit
全局配置    C:/Users/你/.git-hooks
当前仓库    C:/某仓库
结论        已接上，每次提交都会自动检查
```

对照着看：

- 退出码 0、结论「已接上」→ 好了
- 「未设置」「指向别处」→ 按它给出的命令重配
- 报 `cannot execute binary file`、`Exec format error`、`SyntaxError` → **钩子自己是密文**，重装

第三种不影响安全，git 会拒绝提交。但你要知道是钩子坏了，不是文件坏了——这正是当初把它移出仓库的理由。

### 四种用法

```bash
~/.git-hooks/pre-commit               # 检查暂存区（提交时自动跑）
~/.git-hooks/pre-commit --doctor      # 自查钩子有没有真的接上
~/.git-hooks/pre-commit --all         # 检查仓库所有文件
~/.git-hooks/pre-commit --dir 某目录   # 检查任意目录
```

`--dir` 最实用：微信、QQ 传来的 `.kt`、`.md` 基本就是密文，往仓库里拷之前先扫一遍，别等提交时才发现。

### 判据

1. 文件头是 `62142365`，且前 64 字节出现 `E-SafeNet` → 亿赛通密文
2. 含 `0x00` → 不是纯文本
3. 整份不是合法 UTF-8 → 疑似加密或编码损坏

第 1 条是从真实样本取的，最可靠。第 2、3 条兜底，用来抓别的加密产品和损坏文件。

### 一个反直觉的设计：检查暂存区，不检查工作区

磁盘上那个文件是明文还是密文，**取决于哪个进程在读它**。如果 node 被加密软件授权而 git 没有，就会出现最坏情况：你打开看是明文，`git commit` 推上去是密文。

所以钩子用 `git show :路径` 从对象库取字节走管道。那是唯一会被推上 GitHub 的东西，检查它等于检查答案本身。

### 兜底：云端复查

本地钩子可能失效——被加密、被误删、`core.hooksPath` 没配上、或者直接 `--no-verify` 绕过。所以 workflow 在推送后再查一遍，逻辑内联在 yml 里，跑在 GitHub 的机器上，不引用仓库内任何脚本，也就不受本地加密影响。

两层分工：本地拦是为了当场知道，云端拦是为了保证最终结果。

## 钩子源码

存成 `~/.git-hooks/pre-commit`，`chmod +x` 后启用。

```sh
#!/bin/sh
# 提交前明文检查
#
# 这个文件必须放在仓库之外。原因不是洁癖——
# 放在仓库里，它自己就会被磁盘加密变成密文，然后给出错误的诊断：
# 「提交已取消：暂存区里有不是可读文本的文件」，而实际上坏掉的是检测器本身。
#
# 安装位置：~/.git-hooks/pre-commit
# 启用：    git config --global core.hooksPath ~/.git-hooks
#
# 用法：
#   提交时自动跑          检查暂存区里新增和修改的文件
#   pre-commit --doctor   自查：钩子有没有真的被 git 接上
#   pre-commit --all      检查仓库里所有文件
#   pre-commit --dir 路径  检查某个目录（比如刚从微信收到的代码，拷进来之前先扫）
#
# 不依赖任何外部文件，全部逻辑内联在这一个文件里。
# 原理：用 git show 从对象库取字节走管道，不读工作区里的磁盘文件。
#       磁盘上读到明文还是密文，取决于哪个进程在读它；
#       暂存区的字节才是真正会被推上去的东西。

MODE="${1:-staged}"
ARG="${2:-}"

exec node -e '
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function git(args, encoding) {
  return execFileSync("git", args, { maxBuffer: 1 << 28, encoding: encoding });
}

const BINARY = /\.(png|jpe?g|gif|webp|ico|bmp|zip|gz|7z|rar|pdf|apk|jar|aar|so|dll|exe|ttf|otf|woff2?|mp[34]|wav|webm|db|sqlite)$/i;
const dec = new TextDecoder("utf-8", { fatal: true });

function judge(buf) {
  if (!buf || buf.length === 0) return null;
  const hex = buf.subarray(0, 4).toString("hex");
  const head = buf.subarray(0, 64).toString("latin1");
  if (hex === "62142365" || head.indexOf("E-SafeNet") >= 0) {
    return "亿赛通密文（文件头是 E-SafeNet）";
  }
  if (buf.indexOf(0) >= 0) return "含空字节，不是纯文本";
  if (buf.length > 8) {
    try { dec.decode(buf); } catch (e) {
      return "不是合法的 UTF-8（可能被加密，或编码坏了）";
    }
  }
  return null;
}

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (name === ".git" || name === "node_modules" || name === ".gradle" || name === "build") continue;
    const full = path.join(dir, name);
    let st;
    try { st = fs.statSync(full); } catch (e) { continue; }
    if (st.isDirectory()) walk(full, out);
    else if (!BINARY.test(name)) out.push(full);
  }
  return out;
}

const mode = process.argv[1];
const arg = process.argv[2];
const bad = [];
let checked = 0;

if (mode === "--doctor") {
  const selfArg = process.argv[3] || "";
  const out = [];
  let ok = true;

  let selfPath = "";
  let selfSize = 0;
  let selfPlain = false;
  try {
    selfPath = fs.realpathSync(selfArg);
    const buf = fs.readFileSync(selfPath);
    selfSize = buf.length;
    selfPlain = judge(buf) === null;
  } catch (e) {
    selfPath = selfArg || "(未知)";
  }
  if (selfPlain) {
    out.push("钩子文件    明文  " + selfSize + "B  " + selfPath);
  } else {
    out.push("钩子文件    读不到或不是明文  " + selfPath);
    ok = false;
  }

  let hp = "";
  try {
    hp = execFileSync("git", ["config", "--get", "core.hooksPath"], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch (e) {
    hp = "";
  }

  let root = "";
  try {
    root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch (e) {
    root = "";
  }

  const norm = function (p) {
    return path.resolve(p).replace(/\\/g, "/").toLowerCase();
  };

  let connected = false;
  if (!hp) {
    out.push("全局配置    (未设置)  ← git 不会执行这个钩子");
    ok = false;
  } else if (hp.indexOf("~") >= 0) {
    out.push("全局配置    含 ~ 号，git 不会展开它  " + hp);
    ok = false;
  } else {
    const dir = path.resolve(root || process.cwd(), hp);
    const expected = path.join(dir, "pre-commit");
    connected = norm(expected) === norm(selfPath);
    out.push("全局配置    " + hp + (connected ? "" : "  ← 指向别处，没接上"));
    if (!connected) ok = false;
  }

  out.push("当前仓库    " + (root || "(不在 git 仓库里)"));

  if (ok) {
    out.push("结论        已接上，每次提交都会自动检查");
  } else if (!selfPlain) {
    out.push("结论        钩子自身坏了。重新装一份明文。");
  } else if (!hp) {
    out.push("结论        没接上。执行：");
    out.push("            git config --global core.hooksPath " + path.dirname(selfPath).replace(/\\/g, "/"));
  } else {
    out.push("结论        没接上。执行：");
    out.push("            git config --global core.hooksPath " + path.dirname(selfPath).replace(/\\/g, "/"));
  }

  out.forEach(function (l) { console.log(l); });
  process.exit(ok ? 0 : 1);
}

if (mode === "--dir") {
  if (!arg) {
    console.error("用法：pre-commit --dir <目录>");
    process.exit(2);
  }
  if (!fs.existsSync(arg)) {
    console.error("目录不存在：" + arg);
    process.exit(2);
  }
  const files = walk(arg, []);
  for (const f of files) {
    let buf;
    try { buf = fs.readFileSync(f); } catch (e) { continue; }
    if (buf.length === 0) continue;
    checked++;
    const why = judge(buf);
    if (why) bad.push("  " + f + "  —  " + why);
  }
} else {
  const listArgs = mode === "--all"
    ? ["ls-files"]
    : ["diff", "--cached", "--name-only", "--diff-filter=ACM"];
  let files;
  try {
    files = git(listArgs, "utf8").split("\n").filter(Boolean);
  } catch (e) {
    console.error("读不到 git 文件列表，检查中止（不让没有检查过的提交通过）。");
    process.exit(1);
  }
  for (const f of files) {
    if (BINARY.test(f)) continue;
    let buf;
    try { buf = git(["show", ":" + f], "buffer"); } catch (e) { continue; }
    if (buf.length === 0) continue;
    checked++;
    const why = judge(buf);
    if (why) bad.push("  " + f + "  —  " + why);
  }
}

if (bad.length) {
  console.error("");
  console.error("发现 " + bad.length + " / " + checked + " 个文件不是可读明文：");
  bad.forEach(function (l) { console.error(l); });
  console.error("");
  console.error("原因通常是磁盘透明加密：文件被受控进程保存过，存下来的就是密文。");
  if (mode === "--dir") {
    console.error("这批文件不要拷进仓库。");
  } else {
    console.error("能确认是误报才跳过：git commit --no-verify（推送后云端还会再查一次）");
  }
  process.exit(1);
}
' -- "$MODE" "$ARG" "$0"
```

