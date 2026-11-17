# Personal fork: Inline Embeds Peng

## Repository and branches

| Role | Value |
| --- | --- |
| Source directory | `/Users/peng/Documents/GitHub-Peng/ObsidianPlugins-Peng/obsidian-inline-embeds-peng` |
| `origin` | `https://github.com/TheodorePeng/obsidian-inline-embeds-peng` |
| `upstream` | `https://github.com/theluckystrike/inline-block-embeds` |
| Upstream push URL | `no_push_this_remote_is_read_only` |
| Upstream baseline | `1.0.4`, commit `d525a48742b1b7f89271f1cb4c7e2e37a7d40c03` |
| First fork revision | `1.0.5` |
| GitHub default branch | `personal` |

`main` remains a pure upstream mirror. All personal changes stay on `personal`, and `personal` is the GitHub default branch of the fork, so a plain clone or a repository-based install resolves to the fork code instead of upstream. Retain history and review/merge upstream changes manually; conflicts in identity, startup, settings, tests, and documentation are expected to need review. No automatic synchronization is introduced. Synchronization does not authorize a push.

## Settled product decisions

- Plugin ID: `inline-embeds-peng`; displayed name: `Inline Embeds Peng`.
- Retain the npm package name `inline-block-embeds`, internal class names, setting keys, and `ibe-*` CSS/DOM markers.
- Keep minimum Obsidian `1.13.4`, the mobile-compatible platform declaration, and the existing renderer.
- All upstream Free/Pro capabilities work without account or network verification. List-item support is always available; `drawAll=false` and `style=underline` remain the defaults.
- Remove account/licensing and promotion from startup/settings/commands. Keep their upstream source files unreferenced for easier comparison and merges; they must not enter the production bundle.
- Retain only the two functional settings, `drawAll` and `style`.
- The original ID `inline-block-embeds` is recorded for comparison only. Do not read, migrate, clear, or overwrite its settings, token, or sponsorship data.
- Both plugins may be installed; enable only one at a time in the same Vault.
- No new heading, whole-note, table/code/math/callout-target conversion, or in-place source editing.
- The project directory and personal GitHub fork are named `obsidian-inline-embeds-peng`. This does not change the npm package name or plugin ID.

## License and attribution

The original `LICENSE` remains unchanged: MIT, `Copyright (c) 2026 Michael Lip`. MIT grants modification and distribution subject to preserving its copyright and permission notice; it does not contain a personal-use-only restriction. This task's delivery is local and does not authorize publishing.

The build includes the full license text in the JavaScript header so the installed runtime carries the notice. README retains upstream attribution and distinguishes the fork maintainer. Do not replace or erase original copyright.

## Development

Use the existing dependencies and lock file. `scripts/dev.sh` selects `/opt/homebrew/bin` before other Node installations (Node >=24, npm >=11).

```bash
./scripts/dev.sh test
./scripts/dev.sh run lint
./scripts/dev.sh run build
./scripts/dev.sh exec -- tsc --noEmit -p test/e2e/tsconfig.json
git diff --check
```

`main.js` remains an ignored generated file, built in the source directory. Do not run `npm version`: the upstream version hook stages files. Keep manifest/package/lock-root versions and the compatibility table synchronized manually without staging or committing.

## Test deployment

Default Vault: `/Users/peng/Documents/GitHub-Peng/Obsidian AI Coding`.

Plugin target: actual configuration directory + `plugins/inline-embeds-peng/`.

Test notes: `_PluginTests/inline-embeds-peng/` only.

Check realpaths, symlinks, the Obsidian registry, and runtime Vault identity before writes. CLI exit status and Vault names alone are insufficient. A working identity probe on this machine is:

```bash
/opt/homebrew/bin/obsidian vault="Obsidian AI Coding" eval code='JSON.stringify({name:app.vault.getName(),path:app.vault.adapter.getBasePath(),configDir:app.vault.configDir})'
```

For first installation only, verify that the target is absent and copy the three validated runtime artifacts as independent files. Do not copy source `data.json`, create symlinks, or replace the full community-plugin list. Enable only this target plugin.

For ordinary updates, use the Skill's existing deployment entry, first with `--dry-run`, then without it:

```bash
node /Users/peng/Documents/GitHub-Peng/Skills-Peng/obsidian-plugin-dev-peng/scripts/deploy-plugin.mjs \
  --project /Users/peng/Documents/GitHub-Peng/ObsidianPlugins-Peng/obsidian-inline-embeds-peng \
  --vault "Obsidian AI Coding" --dry-run
```

It verifies matching identities and preserves `data.json`. Reload explicitly in the verified target Vault and check the loaded instance and behavior. Do not modify compiled runtime copies or copy them back over source.

## Acceptance and limits

Preserve parser, editor, refresh, cycle/depth, and native-fallback regressions. Test settings and keyboard focus without fake tokens. Validate real desktop behavior separately from mocks and DOM event dispatch. Keep app, installer, platform, production-artifact hashes, data changes, and untested scenarios in `docs/acceptance-1.0.5.md`.

WDIO uses temporary fixture Vault copies. Downloaded test applications stay in cache. Close the user instance before E2E: Obsidian creates and removes the shared CLI socket even when `cli=false`. The test service refuses a launch if another process or shared socket exists. Temporary config separation alone is insufficient. Do not use the shared CLI concurrently with an isolated run. No whole-app restart is authorized by targeted plugin reload.

No automatic stash/reset/clean, production-Vault deployment, shared Skill changes, or external Worker execution. Preserve upstream source files and unrelated work. The release actions recorded under "Release" are the only authorized commits, pushes, tags, and GitHub Release for this fork.

## Release

| Item | Value |
| --- | --- |
| Released version | `1.0.5` |
| Tag | `1.0.5`, unprefixed, as Obsidian expects |
| Release URL | `https://github.com/TheodorePeng/obsidian-inline-embeds-peng/releases/tag/1.0.5` |
| Release assets | `main.js`, `manifest.json`, `styles.css` |
| Branch | `personal`, the GitHub default branch of the fork |
| `main` | Unchanged upstream mirror |

The release is published manually: build locally, push the branch, push the tag, then create the GitHub Release from the locally built files. The published assets must be byte-identical to the locally verified build, because the release guard compares the downloaded release assets against the local files byte by byte and blocks otherwise.

`.github/workflows/release.yml` is inherited from upstream and still builds, tests, attests, and publishes a release. In this fork its trigger is `workflow_dispatch`, so it never races the manual release for the same tag. Re-enabling automatic publishing requires first proving that a Linux build and a local build produce identical bytes.

The upstream tags `1.0.0` through `1.0.4` stay in this repository as upstream history markers. They are not releases of this fork, and they are not deleted.

Release notes are bilingual. The English section follows the upstream commit history, and the Chinese section is written by hand rather than left as the machine-generated English draft.
