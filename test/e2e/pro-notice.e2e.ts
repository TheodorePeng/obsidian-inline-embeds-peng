import { browser, expect } from '@wdio/globals';
import { pluginId, reloadPlugin } from './load';
import type Plugin from '../../src/main';

const DRAW_ALL = 'Draw every block embed inline';
const STYLE = 'Inline style';

interface Notice { text: string; buttons: number }
interface Row { disabled: boolean; checked: boolean | null; value: string | null }

/**
 * Text and Sponsor button count of each shown notice. Obsidian puts a notice in the document of activeWindow. While the
 * settings modal is open in this test, activeWindow is not the main window, so the test reads the document of activeWindow.
 */
async function notices(): Promise<Notice[]> {
	return browser.execute(() => [...(window as unknown as { activeWindow: Window }).activeWindow.document.querySelectorAll('.notice')].map((n) => ({ text: n.textContent ?? '', buttons: n.querySelectorAll('.pf-pro-notice-sponsor').length })));
}

/** Opens the settings tab of the plugin. Removes old notices. */
async function openTab(): Promise<void> {
	await browser.executeObsidian(({ app }, id) => {
		for (const doc of new Set([document, (window as unknown as { activeWindow: Window }).activeWindow.document])) doc.querySelectorAll('.notice').forEach((n) => n.remove());
		const setting = (app as unknown as { setting: { open(): void; openTabById(id: string): void } }).setting;
		setting.open();
		setting.openTabById(id);
	}, pluginId);
	await browser.waitUntil(async () => (await row(DRAW_ALL)) !== null, { timeout: 5000 }).catch(async () => {
		throw new Error(`The settings tab did not show the functional rows: ${await tabDump()}`);
	});
}

/** The names and control classes of the rows in the open tab, for a failure message. */
async function tabDump(): Promise<string> {
	return browser.execute(() => {
		const root = (window as unknown as { app: { setting: { activeTab?: { containerEl: HTMLElement } } } }).app.setting.activeTab?.containerEl ?? document.body;
		return [...root.querySelectorAll('.setting-item')].map((el) => `${el.querySelector('.setting-item-name')?.textContent ?? '?'} [${el.querySelector('.setting-item-control')?.innerHTML.slice(0, 160) ?? ''}]`).join(' | ').slice(0, 1500);
	});
}

/** The state of the control in the settings row with this name, or null when the row is not shown. */
async function row(name: string): Promise<Row | null> {
	return browser.execute((label: string) => {
		const root = (window as unknown as { app: { setting: { activeTab?: { containerEl: HTMLElement } } } }).app.setting.activeTab?.containerEl ?? document.body;
		const item = [...root.querySelectorAll('.setting-item')].find((el) => el.querySelector('.setting-item-name')?.textContent?.trim() === label);
		if (!item) return null;
		const toggle = item.querySelector('.checkbox-container');
		const select = item.querySelector('select');
		const box = item.querySelector<HTMLInputElement>('input[type="checkbox"]');
		if (toggle || box) return { disabled: !!toggle?.classList.contains('is-disabled') || !!box?.disabled || item.classList.contains('is-disabled'), checked: toggle ? toggle.classList.contains('is-enabled') : !!box?.checked, value: null };
		if (select) return { disabled: select.disabled, checked: null, value: select.value };
		return null;
	}, name);
}

/** DOM event coverage of setting controls. Native keyboard input is tested separately in focus-keep.e2e.ts. */
async function useControl(name: string, value?: string): Promise<void> {
	await browser.execute((label: string, v: string | null) => {
		const root = (window as unknown as { app: { setting: { activeTab?: { containerEl: HTMLElement } } } }).app.setting.activeTab?.containerEl ?? document.body;
		const item = [...root.querySelectorAll('.setting-item')].find((el) => el.querySelector('.setting-item-name')?.textContent?.trim() === label);
		if (!item) throw new Error(`no row ${label}`);
		// Match a focused control while dispatching DOM events; this is not native user input.
		if (v === null) { const box = (item.querySelector('.checkbox-container') ?? item.querySelector('input[type="checkbox"]')) as HTMLElement; box.focus(); box.click(); return; }
		const select = item.querySelector('select')!;
		select.focus();
		select.value = v;
		select.dispatchEvent(new Event('change', { bubbles: true }));
	}, name, value ?? null);
}

async function settings(): Promise<{ drawAll: boolean; style: string }> {
	return browser.executeObsidian(({ app }, id) => {
		const p = (app as unknown as { plugins: { plugins: Record<string, Plugin> } }).plugins.plugins[id]!;
		return { drawAll: p.settings.drawAll, style: p.settings.style };
	}, pluginId);
}

async function closeAndReset(): Promise<void> {
	await browser.executeObsidian(async ({ app }, id) => {
		const p = (app as unknown as { plugins: { plugins: Record<string, Plugin> } }).plugins.plugins[id]!;
		(app as unknown as { setting: { close(): void } }).setting.close();
		p.settings.drawAll = false;
		p.settings.style = 'underline';
		await p.saveSettings();
		p.redrawAll();
	}, pluginId);
}

describe('All settings available without an account', () => {
	afterEach(closeAndReset);

	it('saves both options and all styles without a paid-feature notice', async () => {
		await openTab();
		expect(await row(DRAW_ALL)).toEqual({ disabled: false, checked: false, value: null });
		expect(await row(STYLE)).toEqual({ disabled: false, checked: null, value: 'underline' });
		await useControl(DRAW_ALL);
		await browser.waitUntil(async () => (await settings()).drawAll, { timeout: 5000 });
		for (const style of ['background', 'none', 'underline']) {
			await useControl(STYLE, style);
			await browser.waitUntil(async () => (await settings()).style === style, { timeout: 5000 });
			expect(await row(STYLE)).toEqual({ disabled: false, checked: null, value: style });
		}
		expect((await notices()).filter((n) => /pro|sponsor|sign in/i.test(n.text))).toEqual([]);
		const dump = await tabDump();
		expect(dump).not.toMatch(/pro features|sign in|github|notemods|what.s new/i);
		const saved = await browser.executeObsidian(async ({ app }, id) => {
			const p = (app as unknown as { plugins: { plugins: Record<string, Plugin> } }).plugins.plugins[id]!;
			return p.loadData();
		}, pluginId);
		expect(saved).toEqual({ drawAll: true, style: 'underline' });
	});

	it('keeps chosen settings after disabling and re-enabling the plugin', async () => {
		await openTab();
		await useControl(DRAW_ALL);
		await useControl(STYLE, 'none');
		await browser.waitUntil(async () => (await settings()).drawAll && (await settings()).style === 'none', { timeout: 5000 });
		await browser.executeObsidian(({ app }) => (app as unknown as { setting: { close(): void } }).setting.close());
		expect(await reloadPlugin(pluginId)).toEqual({ enabled: true, reloaded: true, errors: [] });
		expect(await settings()).toEqual({ drawAll: true, style: 'none' });
	});
});
