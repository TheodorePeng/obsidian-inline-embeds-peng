import { $, browser, expect } from '@wdio/globals';
import { pluginId } from './load';

// A real keyboard selection must save immediately without a paid-feature notice or lost focus.
const ROW = 'Inline style';

type Host = {
	plugins: { plugins: Record<string, Record<string, unknown>> };
	setting: { open(): void; close(): void; openTabById(id: string): void };
};

interface Where {
	hasFocus: boolean;
	tag: string;
	row: string | null;
	value: string | null;
	notices: number;
}

/** Runs in the window that shows the settings: where the keyboard focus is, and the state of the row control. */
const where = (): Promise<Where> =>
	browser.execute((name: string) => {
		const a = document.activeElement as HTMLElement | null;
		const row = [...document.querySelectorAll('.setting-item')].find((r) => r.querySelector('.setting-item-name')?.textContent === name);
		const control = row?.querySelector<HTMLSelectElement | HTMLInputElement>('select, input');
		const docs = new Set([document, (window as unknown as { activeDocument?: Document }).activeDocument ?? document]);
		return {
			hasFocus: document.hasFocus(),
			tag: a ? a.tagName.toLowerCase() : '',
			row: a?.closest('.setting-item')?.querySelector('.setting-item-name')?.textContent ?? null,
			value: control ? (control.tagName === 'INPUT' ? String((control as HTMLInputElement).checked) : control.value) : null,
			notices: [...docs].reduce((n, d) => n + d.querySelectorAll('.notice').length, 0),
		};
	}, ROW);

describe(`${pluginId} keyboard focus after a saved setting`, function () {
	let main = '';
	after(async function () {
		if (main) await browser.switchToWindow(main);
		await browser.executeObsidian(({ app }) => {
			(app as unknown as Host).setting.close();
			activeDocument.querySelectorAll('.notice').forEach((n) => n.remove());
		});
	});

	it(`a user who changes "${ROW}" with a key keeps the keyboard focus on that control (desktop only: phone and tablet have no keyboard focus ring)`, async function () {
		if (await browser.executeObsidian(({ obsidian }) => obsidian.Platform.isMobile)) this.skip();
		main = await browser.getWindowHandle();
		await browser.executeObsidian(({ app }, id) => {
			activeDocument.querySelectorAll('.notice').forEach((n) => n.remove());
			const setting = (app as unknown as Host).setting;
			setting.open();
			setting.openTabById(id);
		}, pluginId);
		await browser.waitUntil(
			async () => browser.executeObsidian((_o, name) => [...activeDocument.querySelectorAll('.setting-item-name')].some((e) => e.textContent === name), ROW),
			{ timeout: 10000, timeoutMsg: `The settings tab has no row "${ROW}".` },
		);
		await browser.pause(500);
		// Send the keys to the window that shows the row.
		let found = '';
		for (const handle of await browser.getWindowHandles()) {
			await browser.switchToWindow(handle);
			const has = await browser.execute((name: string) => [...document.querySelectorAll('.setting-item-name')].some((e) => e.textContent === name), ROW);
			if (has) {
				found = handle;
				break;
			}
		}
		expect(found).not.toBe('');
		// Put the keyboard focus on the control of the row. Then check that this window has the focus, so a real key goes there.
		// The key: Space for a toggle. For a dropdown, the first letter or digit of another option (type-ahead), sent
		// with WebDriver Element Send Keys (probe run 40628437449). The controls can come from another window realm, so
		// the test checks tagName, not instanceof.
		const key = await browser.execute((name: string) => {
			const row = [...document.querySelectorAll('.setting-item')].find((r) => r.querySelector('.setting-item-name')?.textContent === name)!;
			const control = row.querySelector<HTMLElement>('select, .checkbox-container')!;
			control.focus();
			document.querySelectorAll('[data-focus-test]').forEach((e) => e.removeAttribute('data-focus-test'));
			control.setAttribute('data-focus-test', '1');
			document.querySelectorAll('.notice').forEach((n) => n.remove());
			if (control.tagName !== 'SELECT') return '\uE00D';
			const select = control as HTMLSelectElement;
			const first = (o: HTMLOptionElement | undefined): string => (o?.text.trim()[0] ?? '').toLowerCase();
			const current = first(select.options[select.selectedIndex]);
			const other = [...select.options].map(first).find((c) => /^[a-z0-9]$/.test(c) && c !== current);
			if (!other) throw new Error(`No option of "${name}" starts with another letter or digit.`);
			return other;
		}, ROW);
		const before = await where();
		expect({ hasFocus: before.hasFocus, row: before.row }).toEqual({ hasFocus: true, row: ROW });
		// WebDriver sends a real key to the focused native select.
		await $('[data-focus-test="1"]').addValue(key);
		await browser.waitUntil(async () => (await where()).value !== before.value, { timeout: 5000 });
		const after = await where();
		expect({ notices: after.notices, tag: after.tag, row: after.row }).toEqual({ notices: 0, tag: before.tag, row: ROW });
		const saved = await browser.executeObsidian(async ({ app }, id) => {
			const p = (app as unknown as { plugins: { plugins: Record<string, { loadData(): Promise<{ style: string }> }> } }).plugins.plugins[id]!;
			return (await p.loadData()).style;
		}, pluginId);
		expect(saved).toBe(after.value);
	});
});
