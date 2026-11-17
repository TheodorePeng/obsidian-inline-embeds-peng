import { browser, expect } from '@wdio/globals';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pluginId } from './load';

interface Product {
	settings: { drawAll: boolean; style: string };
	saveSettings(): Promise<void>;
	loadData(): Promise<unknown>;
	redrawAll(): void;
}

describe('Independent runtime and coexistence', () => {
	it('uses a CLI-disabled isolated test process without an account manager or promotional commands', async () => {
		const state = await browser.executeObsidian(({ app, require }, id) => {
			const remote = require('@electron/remote') as { app: { getPath(name: string): string } };
			const host = app as unknown as { plugins: { plugins: Record<string, object> }; commands: { commands: Record<string, unknown> } };
			return { config: remote.app.getPath('userData'), hasManager: 'pro' in host.plugins.plugins[id]!, commands: Object.keys(host.commands.commands).filter((key) => key.startsWith(id + ':')) };
		}, pluginId);
		expect((JSON.parse(readFileSync(path.join(state.config, 'obsidian.json'), 'utf8')) as { cli: boolean }).cli).toBe(false);
		expect(state.hasManager).toBe(false);
		expect(state.commands).toEqual([]);
	});

	it('renders paragraph, list and standalone embeds with a saved style while the test session is offline', async () => {
		await browser.executeObsidian(async ({ app, require }, id) => {
			const remote = require('@electron/remote') as { getCurrentWindow(): { webContents: { session: { enableNetworkEmulation(options: { offline: boolean }): void } } } };
			remote.getCurrentWindow().webContents.session.enableNetworkEmulation({ offline: true });
			const plugin = (app as unknown as { plugins: { plugins: Record<string, Product> } }).plugins.plugins[id]!;
			plugin.settings = { drawAll: true, style: 'none' };
			await plugin.saveSettings();
			await app.vault.create('Offline source.md', 'Offline paragraph ^p\n\n- [ ] Offline task ^t\n');
			const host = await app.vault.create('Offline host.md', 'Read ![[Offline source#^p]] now.\n\nTask ![[Offline source#^t]] now.\n\n![[Offline source#^p]]\n');
			const leaf = app.workspace.getLeaf(true);
			await leaf.openFile(host);
			await leaf.setViewState({ ...leaf.getViewState(), state: { file: host.path, mode: 'preview' } });
		}, pluginId);
		try {
			await browser.waitUntil(async () => browser.execute(() => {
				const spans = [...document.querySelectorAll('.workspace-leaf.mod-active .markdown-reading-view .ibe-inline')];
				return spans.length === 3 && spans.every((el) => el.classList.contains('ibe-style-none')) && spans.some((el) => el.textContent === 'Offline task');
			}), { timeout: 10000, timeoutMsg: 'Offline embeds did not render.' });
		} finally {
			await browser.executeObsidian(async ({ app, require }, id) => {
				const remote = require('@electron/remote') as { getCurrentWindow(): { webContents: { session: { disableNetworkEmulation(): void } } } };
				remote.getCurrentWindow().webContents.session.disableNetworkEmulation();
				const plugin = (app as unknown as { plugins: { plugins: Record<string, Product> } }).plugins.plugins[id]!;
				plugin.settings = { drawAll: false, style: 'underline' };
				await plugin.saveSettings();
				plugin.redrawAll();
			}, pluginId);
		}
	});

	it('keeps the original and fork installed independently with only one enabled', async function () {
		if (!process.env.IBE_UPSTREAM_FIXTURE) this.skip();
		const result = await browser.executeObsidian(async ({ app }, id) => {
			const plugins = (app as unknown as { plugins: { plugins: Record<string, Product>; manifests: Record<string, unknown>; enabledPlugins: Set<string>; enablePlugin(id: string): Promise<boolean>; disablePlugin(id: string): Promise<void> } }).plugins;
			const originalId = 'inline-block-embeds';
			const bothInstalled = id in plugins.manifests && originalId in plugins.manifests;
			const fork = plugins.plugins[id]!;
			const before = { ...fork.settings };
			await plugins.disablePlugin(id);
			await plugins.enablePlugin(originalId);
			const original = plugins.plugins[originalId]!;
			original.settings = { drawAll: true, style: 'background' };
			await original.saveSettings();
			const originalBefore = await original.loadData();
			await plugins.disablePlugin(originalId);
			await plugins.enablePlugin(id);
			const current = plugins.plugins[id]!;
			current.settings = { drawAll: true, style: 'none' };
			await current.saveSettings();
			const originalAfter = await original.loadData();
			const enabled = [...plugins.enabledPlugins].filter((key) => key === id || key === originalId);
			current.settings = before;
			await current.saveSettings();
			current.redrawAll();
			return { bothInstalled, preserved: JSON.stringify(originalAfter) === JSON.stringify(originalBefore), originalAfter, enabled };
		}, pluginId);
		expect(result).toMatchObject({ bothInstalled: true, preserved: true, originalAfter: { drawAll: true, style: 'background' }, enabled: [pluginId] });
	});
});
