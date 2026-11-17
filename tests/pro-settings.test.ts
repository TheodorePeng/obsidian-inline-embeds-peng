// The filename is retained to keep this fork easy to compare with upstream.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App, SettingTab } from 'obsidian-test-mocks/obsidian';
import InlineBlockEmbedsPlugin from '../src/main';
import { InlineBlockEmbedsSettingTab } from '../src/settings';
import manifest from '../manifest.json';

function tab() {
	const app = App.createConfigured__({ files: {} });
	const plugin = new InlineBlockEmbedsPlugin(app as never, manifest as never);
	const redraw = vi.fn();
	plugin.redrawAll = redraw;
	return { t: new InlineBlockEmbedsSettingTab(app as never, plugin), plugin, redraw };
}

describe('Independent plugin settings (no account)', () => {
	afterEach(() => vi.restoreAllMocks());

	it('exposes only the two functional settings and all three styles', () => {
		const { t } = tab();
		const definitions = t.getSettingDefinitions();
		expect(definitions).toHaveLength(2);
		expect(JSON.stringify(definitions)).not.toMatch(/pro|sponsor|github|notemods|sign in/i);
		expect(definitions[1]).toMatchObject({ control: { options: { underline: 'Dotted underline', background: 'Soft background', none: 'None' } } });
	});

	it.each([['drawAll', true], ['style', 'background'], ['style', 'none'], ['style', 'underline']])('delegates %s=%s to native persistence and redraws without rebuilding the tab', async (key, value) => {
		const { t, redraw } = tab();
		const save = vi.spyOn(SettingTab.prototype, 'setControlValue');
		const update = vi.spyOn(t, 'update');
		await t.setControlValue(key as string, value);
		expect(save).toHaveBeenCalledWith(key, value);
		expect(redraw).toHaveBeenCalledTimes(1);
		expect(update).not.toHaveBeenCalled();
	});

	it('does not clear saved choices while normalizing incomplete settings', async () => {
		const { t, plugin } = tab();
		plugin.settings = { style: 'none' } as never;
		await t.setControlValue('style', 'none');
		expect(plugin.settings).toEqual({ drawAll: false, style: 'none' });
	});
});
