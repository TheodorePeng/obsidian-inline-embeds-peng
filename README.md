# Inline Embeds Peng

A personal fork of [Inline Block Embeds](https://github.com/theluckystrike/inline-block-embeds), originally written by Michael Lip. It renders a block embed inside a sentence as inline text, with a source preview and navigation.

All functionality in the upstream 1.0.4 Free and Pro editions is available without an account, payment, token, or license check. The plugin itself makes no network requests. Remote content rendered by Obsidian or other plugins is outside this claim.

**Latest release:** `v1.0.5` · [GitHub Release](https://github.com/TheodorePeng/obsidian-inline-embeds-peng/releases/tag/1.0.5)

## Install with BRAT

[BRAT](https://github.com/TfTHacker/obsidian42-brat) is the distribution channel for this fork: it installs the plugin from the GitHub Release of this repository and can deliver later versions to the same vault.

1. Install **BRAT** from Obsidian's Community Plugins and enable it.
2. Open the command palette and run **BRAT: Add a beta plugin for testing**.
3. Enter the repository `TheodorePeng/obsidian-inline-embeds-peng` and click **Add Plugin**.
4. Open Settings → Community plugins, refresh the list, and enable **Inline Embeds Peng**.

BRAT installs the plugin into `<vault>/.obsidian/plugins/inline-embeds-peng/`, using the plugin ID from the released `manifest.json`.

To update, run **BRAT: Check for updates to all beta plugins and UPDATE** from the command palette. Auto-update on startup can be enabled in the `Obsidian42- BRAT` settings tab. To stay on one version, use **BRAT: Add a beta plugin with frozen version based on a release tag** and pick a tag such as `1.0.5`.

Manual installation is an alternative to BRAT: copy `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/TheodorePeng/obsidian-inline-embeds-peng/releases/tag/1.0.5) into `<vault>/.obsidian/plugins/inline-embeds-peng/`.

BRAT's own behavior can change over time, so check the [official BRAT documentation](https://tfthacker.com/BRAT) if a step no longer matches what is written here. This fork and the upstream plugin process the same embed syntax, so enable only one of them in the same vault.

## 通过 BRAT 安装

[BRAT](https://github.com/TfTHacker/obsidian42-brat) 是本 fork 的分发入口:它从本仓库的 GitHub Release 安装插件,并能在后续版本发布后把更新送进同一个 Vault。

1. 在 Obsidian 的第三方插件市场安装 **BRAT** 并启用。
2. 打开命令面板,运行 **BRAT: Add a beta plugin for testing**。
3. 输入仓库地址 `TheodorePeng/obsidian-inline-embeds-peng`,点击 **Add Plugin**。
4. 打开 设置 → 第三方插件,刷新列表,启用 **Inline Embeds Peng**。

BRAT 依据 Release 中 `manifest.json` 的插件 ID,把插件安装到 `<vault>/.obsidian/plugins/inline-embeds-peng/`。

更新方式:在命令面板运行 **BRAT: Check for updates to all beta plugins and UPDATE**;也可在 `Obsidian42- BRAT` 设置页开启启动时自动更新。若要固定在某个版本,使用 **BRAT: Add a beta plugin with frozen version based on a release tag**,选择 `1.0.5` 这样的 tag。

不装 BRAT 也可以手动安装:从[最新 Release](https://github.com/TheodorePeng/obsidian-inline-embeds-peng/releases/tag/1.0.5)下载 `main.js`、`manifest.json`、`styles.css`,放进 `<vault>/.obsidian/plugins/inline-embeds-peng/`。

BRAT 自身的行为会随版本变化,若实际步骤与上文对不上,请以[官方 BRAT 文档](https://tfthacker.com/BRAT)为准。本 fork 与上游插件处理同一套嵌入语法,同一个 Vault 里只能启用其中一个。

## Features

- Paragraph and list-item block embeds in Live Preview and Reading view.
- Inline Markdown formatting, including emphasis, links, and inline code.
- List items without their bullet, number, or task checkbox.
- Core Page Preview on hover and Ctrl/Cmd click to open the source block.
- Source updates, including unsaved editor changes, propagate to existing embeds.
- Missing blocks show the alias or link text; nested embeds stop at depth three or a loop.
- Optional inline rendering of block embeds that occupy a whole line.
- Dotted underline, soft background, and undecorated styles.
- Reading-view post-processing is retained for the PDF rendering path.

The plugin changes the presentation, not the Markdown stored in your notes.

## Usage

Give a paragraph or list item a block ID, then embed it in another sentence:

```markdown
Hello **world**. ^greeting

Read ![[Sources#^greeting]] today.
```

Move the cursor into an embed to edit its original `![[...]]` syntax. A plain click reveals that syntax; Ctrl/Cmd click navigates to the source. Enable the core Page Preview plugin to use hover previews.

Only block references using `#^id` are converted. Headings, whole-note embeds, ranges, tables, code, math, callout targets, and other unsupported block types keep their upstream/native behavior. Embeds inside reading-view table cells and callouts retain the upstream rules.

## Settings

| Setting | Behavior | Default |
| --- | --- | --- |
| Draw every block embed inline | Also render an embed that occupies a whole line as inline text | Off |
| Inline style | Dotted underline, soft background, or none | Dotted underline |

List-item blocks are always available. There is no account, paid-feature toggle, login UI, promotional card, or automatic What's new page.

## Build and install locally

Requires Node >=24, npm >=11, and Obsidian >=1.13.4. Existing dependencies are retained. On this Mac, the wrapper selects Homebrew Node:

```bash
./scripts/dev.sh test
./scripts/dev.sh run lint
./scripts/dev.sh run build
```

For a fresh checkout without dependencies, first run `./scripts/dev.sh ci`.

Manual installation from a local build is an alternative to BRAT: copy only `main.js`, `manifest.json`, and `styles.css` from the successful build into `<vault>/<configDir>/plugins/inline-embeds-peng/`, then enable **Inline Embeds Peng**. The normal config directory is `.obsidian`. This fork is distributed through GitHub Releases and is not submitted to the community plugin directory.

For ordinary updates in Peng's test Vault, use the unified deployment entry documented in `FORK.md`; it preserves `data.json`. Never copy the full repository or development dependencies into a Vault.

## Original plugin and settings

This fork uses the independent ID `inline-embeds-peng`. The original uses `inline-block-embeds`. Both may be installed, but enable only one in a Vault because both process the same embed syntax.

The fork starts with its own default settings and does not import, move, or delete original settings, tokens, or sponsorship records. Existing `ibe-*` CSS markers and the npm package name are retained to keep the upstream diff small. The source project folder name does not determine the installed plugin ID.

## Tests and evidence

`./scripts/dev.sh test` runs parser, editor-cache, rendering, refresh, settings, and production-dependency-graph regressions using mocks. `./scripts/dev.sh run build` includes TypeScript checking. `./scripts/dev.sh exec -- tsc --noEmit -p test/e2e/tsconfig.json` checks the existing real-app tests.

`./scripts/dev.sh run test:e2e` uses the existing WDIO Obsidian service. It copies its fixture Vault and may download desktop builds. It refuses to launch while another Obsidian process or shared CLI socket exists. Use `WDIO_MAX_INSTANCES=1` and explicit `OBSIDIAN_VERSIONS` app/installer pairs. It must not replace or restart the user's Obsidian application. A prepared upstream fixture can be included with `IBE_UPSTREAM_FIXTURE` for coexistence checks.

Current execution results and limitations are recorded in [the 1.0.5 acceptance report](docs/acceptance-1.0.5.md). Automated mocks, app probes, native input, PDF export, and mobile/device results are distinguished there. Original assets in `docs/` remain upstream reference material and are not evidence of the fork's settings UI.

## Maintenance and license

Personal changes remain on `personal`; `main` stays an upstream mirror. See [FORK.md](FORK.md) for development, deployment, and synchronization decisions.

Original project: [theluckystrike/inline-block-embeds](https://github.com/theluckystrike/inline-block-embeds). Original copyright: **Copyright (c) 2026 Michael Lip**. Fork maintained by [TheodorePeng](https://github.com/TheodorePeng).

The original [MIT license](LICENSE) is preserved unchanged and included in the generated JavaScript header. Upstream licensing and promotion source modules remain for comparison and future merges, but are disconnected from the runtime entrypoint and excluded from the bundle. Releases are published manually from the `personal` branch so the published assets stay byte-identical to the verified local build; see [FORK.md](FORK.md) for the release procedure.
