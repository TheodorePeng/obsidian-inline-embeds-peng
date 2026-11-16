# FORK.md — 个人 Fork 说明

> 本文件只在 `personal` 分支存在，上游不会有这个路径，因此永不冲突。

## 一、仓库关系

| 角色 | 地址 | 用途 |
| --- | --- | --- |
| `upstream` | https://github.com/theluckystrike/inline-block-embeds | 原作者仓库，**只 fetch，不可 push**（push URL 已置为 `no_push_this_remote_is_read_only`） |
| `origin` | https://github.com/TheodorePeng/inline-block-embeds | 我自己的 Fork，push 目标 |
| 本地路径 | `/Users/peng/Documents/GitHub-Peng/ObsidianPlugins-Peng/inline-block-embeds-peng` | |

- 原始许可证：**MIT**，`Copyright (c) 2026 Michael Lip`。`LICENSE` 保持原样，不得删除或修改版权声明。
- 基线版本：`1.0.4`（上游 tag 为裸版本号，无 `v` 前缀）。
- `minAppVersion`：`1.13.4`。

## 二、分支约定

| 分支 | 规则 |
| --- | --- |
| `main` | **纯镜像**，只允许 `git merge --ff-only upstream/main`，永不本地提交 |
| `personal` | 所有个人化改动（改功能、加特性、改名）都落在这里 |

`git config push.default = current`，防止误把 `personal` 推到 `origin/main`。

### 同步上游

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push                      # 更新 fork 的 main
git switch personal
git merge main                # 关键：这一步别忘，否则 personal 会漂移
```

### 查看我改了什么

```bash
git diff upstream/main personal
```

## 三、开发环境

### Node 版本（重要）

上游 `package.json` 要求 `engines: { node: ">=24", npm: ">=11" }`，CI 固定 node 24.x。

本机有多个 Node，**不要用错**：

| 来源 | 版本 | 可用性 |
| --- | --- | --- |
| PATH 首位的 `node` | v22.22.2 | ❌ WorkBuddy 自带运行时，不能用于构建 |
| Homebrew `/opt/homebrew/bin/node` | v26.8.2（npm 11.19.1） | ✅ 本项目使用这个 |
| nvm 默认 | v22.17.0 | ❌ 不满足 engines |

统一入口（强制 PATH）：

```bash
./scripts/dev.sh ci       # = npm ci
./scripts/dev.sh run build
./scripts/dev.sh run lint
./scripts/dev.sh test
```

### 命令

```bash
npm ci            # 按 package-lock.json 精确安装
npm run build     # tsc -noEmit + esbuild production → main.js
npm run lint      # eslint --max-warnings 0 + stylelint
npm test          # vitest run
npm run dev       # esbuild watch（开发时常驻）
```

`npm run test:e2e`（wdio）会通过 `obsidian-launcher` 下载真实 Obsidian 桌面版，首次数百 MB，默认不跑。

构建产物 `main.js` 被 `.gitignore` 忽略（与上游一致），不入库。

## 四、待决事项

### 1. Pro 门控（未决，本次未改动）

上游把 Pro 功能用 GitHub Sponsors 订阅检查门控：`src/pro.ts` 的 `isPro()` 是唯一判定点，由 `src/license/`（OAuth 设备码 + 赞助状态查询）驱动。**Pro 的代码路径本身就在同一个 bundle 里**，只是被这个布尔值挡住。

三条路，按风险从低到高：

1. **赞助解锁**（零风险）：赞助 `$15` 一次性或 `$5/月`，插件内「Sign in with GitHub」后 Pro 自动开启。不改任何代码，同步最干净。
2. **本地开关**（自用，不分发）：在 `personal` 分支把 `isPro()` 接成本地配置项。MIT 许可授权修改，但仅限个人使用；对外分发等于绕过作者付费墙，不做。
3. **暂不处理**：先用 Free 功能。

本次初始化**没有碰** `src/license/` 和 `src/pro.ts`。

### 2. Phase 2 改名清单（只记录，未执行）

改名要一次性对齐下面所有项，否则会出现「改了一半」的状态：

- `manifest.json`：`id`、`name`、`author`、`authorUrl`、`fundingUrl`
- `styles.css` 的 CSS 类名前缀
- 命令 ID（`inline-block-embeds:*`）
- 设置页 / 设置项的 key
- release 资产名、BRAT slug
- `package.json` 的 `name`、`description`
- 本地目录名与 GitHub 仓库名

**`data.json` 迁移警告**：Obsidian 按 `id` 把配置存在 `.obsidian/plugins/<id>/data.json`。改 `id` 会让老用户的设置「消失」（实际是读不到）。迁移只能在插件首次加载时读旧路径，因此**旧 id `inline-block-embeds` 必须长期记录在此**。

## 五、红线

- 不删上游文件（含 `.github/workflows/*`）—— 删了以后每次同步必冲突
- 不在 fork 上启用 GitHub Actions（上游 `release.yml` 由 tag 触发，fork 上误跑会发 release）
- 不推送任何 tag
- 不使用 force push / hard reset
- `LICENSE` 与版权声明保持原样
