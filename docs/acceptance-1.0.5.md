# Inline Embeds Peng 1.0.5 acceptance

Date: 2026-11-17 (Asia/Shanghai). Platform: macOS arm64.

## Source and installed identity

- Source: `inline-block-embeds-peng`, branch `personal`, uncommitted changes on HEAD `bc00a2bce1c405d4984d9c25c89086a5209fd366`.
- Published as GitHub Release `1.0.5`; the release commit is the `1.0.5` tag in this repository.
- Upstream baseline: 1.0.4, `d525a48742b1b7f89271f1cb4c7e2e37a7d40c03`.
- Fork: `Inline Embeds Peng`, ID `inline-embeds-peng`, version 1.0.5; npm name retained.
- Minimum app version remains 1.13.4; desktop/mobile platform declaration retained.
- Test Vault: `/Users/peng/Documents/GitHub-Peng/Obsidian AI Coding`; actual config directory `.obsidian`.
- First installation copied only the three runtime artifacts as independent files into the new ID directory. Original ID was absent from this real Vault and was not installed there for testing.
- All test notes are under `_PluginTests/inline-embeds-peng/`.

## Build and automated checks

| Check | Result |
| --- | --- |
| Unit/regression tests | 117 passed, 8 files; mocks/happy-dom, not a live application |
| ESLint + stylelint | Passed, zero warnings allowed by project scripts |
| TypeScript + production esbuild | Passed |
| E2E TypeScript checking | Passed |
| Whitespace/error check | `git diff --check` passed |
| Runtime dependency graph | No `src/pro.ts`, license, hello, or What's new modules reachable from the bundled entrypoint |
| Bundle scan | OAuth client ID, GitHub licensing endpoints, token slot and promotion marker absent |
| License | Original LICENSE byte-for-byte unchanged; full text included in main.js banner |

Vitest prints an existing advisory about the future Vite native config loader and the extensionless time-scale import. Tests pass; configuration/toolchain was not upgraded.

## Real Obsidian E2E

The existing WDIO service uses copied fixture Vaults, not the user's Vault. An original-plugin fixture was built from the pinned local upstream commit with the existing development dependencies; no real token, sign-in, sponsorship, or payment was used.

| App / installer | Result |
| --- | --- |
| 1.15.1 / 1.13.7 | 27 passed across 5 specs |
| 1.13.4 / 1.13.7 | 27 passed, supplemental mixed-version run; service warned about installer compatibility, so this is not the matching-installer acceptance |
| 1.13.4 / 1.13.4 | 27 passed across 5 specs; matching installer, no compatibility warning |

Coverage includes native WebDriver keyboard selection/focus, direct availability of all settings, persistence across disable/enable, absence of account manager/promotional commands, offline-session rendering, original/fork coexistence and preservation of the original's full saved configuration, paragraph/list/standalone embeds, missing blocks, edit/cursor behavior, core hover preview, source navigation, source updates, cycle/depth limits, renames/refreshes, native fallbacks, unchanged note bytes, and detached export rendering.

The original persists its own `notemodsHello` metadata. The coexistence test compares the complete original configuration before/after fork changes rather than assuming only two keys exist. It always enables just one version at a time.

Both formal app environments passed 27 tests each (54 E2E checks total); the mixed-installer run is supplemental and is not counted in that total. The matching minimum-version run observed about 275 ms for an editor update and about 28 ms for a disk write.

Current-app samples: unsaved editor update to inline render about 262 ms; disk write about 32 ms. A detached export render of 300 three-level chains and 600 nested spans completed in about 817 ms, with no pending/queued/orphan renders. These are observed samples, not universal performance guarantees.

Offline evidence uses Electron test-session network emulation plus a production dependency/bundle audit. It does not change the Mac's network settings or claim to monitor all networking by Obsidian/other plugins. Some existing E2E setting/source-navigation helpers dispatch DOM events; native input evidence is identified separately below.

## Native desktop acceptance in the real test Vault

Observed with Obsidian 1.15.1, installer 1.13.7, using CUA native application controls:

- Refreshed the installed-plugin list, enabled Inline Embeds Peng, and opened its actual settings page.
- Only the two functional rows appeared; no login, sponsorship, price, Pro notice, promotion card, or What's new entry.
- Toggled standalone rendering, selected soft background with the mouse, then selected none with keyboard arrows/Return. The focused control remained the style dropdown. Saved data was `{ "drawAll": true, "style": "none" }` at that point.
- Opened the dedicated Host note in a new tab. Live Preview and Reading view both displayed paragraph, task, ordered-list, plain-list and standalone block text. Missing alias and native table fallback remained visible.
- Native Cmd-click opened the Sources note in a new tab at the source block.
- A native test edit propagated to the host; native undo restored the source and both embeds. This manual observation does not establish the one-second bound; the timed E2E does.
- Closed only the two test tabs afterwards. The original user tab was left intact.
- SHA-256 checks after edit/undo matched the initial contents of all five created Markdown fixtures.

## Application isolation incident and recovery

The initial isolated smoke passed, but the official CLI connection to the user's still-running application stopped working after test exit. Inspecting the installed Obsidian main-process code showed that it unconditionally creates/unlinks `~/.obsidian-cli.sock`, even with `cli=false` in the temporary config. No socket deletion or shared-config reset was attempted by this implementation.

The user explicitly authorized checking saved editor state and restarting Obsidian. A read-only probe confirmed no unsaved Markdown editors in the three open Vault windows. Subsequent complete E2E runs execute only with the user instance closed.

The local WDIO adapter now refuses to prepare/launch a session while another Obsidian process or the shared socket exists, and disables the CLI in its own verified temporary config. These guards supplement temporary Vault/config separation; they do not pretend that simultaneous instances have independent CLI endpoints. No global dependencies or shared Skill files were patched.

Final recovery verified: the original `/Applications/Obsidian.app` is running Obsidian 1.15.1 with installer 1.13.7. The CLI again reaches the exact registered test Vault path. The deployed `inline-embeds-peng` instance was reloaded and reports version 1.0.5, settings `{ "drawAll": false, "style": "underline" }`, and no account manager. The original test-Vault working note was reopened after recovery.

The startup guard's refusal path was also exercised with the user instance running: it rejected before preparing or launching another app. No additional instance was started for this check.

CLI targeting must put `vault=...` before the command. A trailing Vault parameter was observed to target the foreground English Vault instead; that probe was read-only, no writes were attempted through it. Subsequent setting changes/reload used the leading parameter and explicit name/path verification.

## Runtime artifacts

- `main.js`: SHA-256 `8e7df739d9705745b48305d914b44e266de20db3b4c7dcacea3e89f785d3fdbd`
- `manifest.json`: SHA-256 `a2242266ff334dca5f3f134a1a039f2f03f02cbc8cc7c86a389dd72de60f74bf`
- `styles.css`: SHA-256 `322470cec06841d10df43ab143767417f348379363c0ac15534ab1f7c4023d5d`

`main.js` is generated/ignored and is 26,303 bytes. The source repository and installed artifacts were compared after first installation. The Skill unified deploy entry subsequently passed both dry-run and actual update, confirmed `dataJsonPreserved=true`, and made a runtime-artifact backup. Deployment did not overwrite settings; final defaults were set through the running target plugin and persisted across reload.

## Remaining limits and data scope

- Actual PDF file export, real mobile devices, Windows and Linux are not verified. Detached postprocessor/export-path rendering is verified and is not equivalent to opening a generated PDF.
- Tests do not add heading/whole-note/table/code/math/callout-target conversion or in-place source editing.
- The original plugin's real credentials/settings are neither migrated nor cleared. The original installed ID was not created in the real test Vault.
- Only this plugin's runtime/settings and five dedicated test notes were created/changed in the test Vault. Test input was undone and fixture contents verified.
- No commit, staging, push, tag, release, Actions activation, project-directory rename, production-Vault deployment or external Worker was performed.

## Subsequent repository rename

After this acceptance, on 2026-11-17, the local project directory and personal GitHub fork were renamed to `obsidian-inline-embeds-peng`. The paths and artifact hashes above document the original acceptance at its time.
