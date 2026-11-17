import { PluginSettingTab, type SettingDefinitionItem } from 'obsidian';
import type { EmbedStyle, Options } from './render';
import type InlineBlockEmbedsPlugin from './main';

export interface InlineBlockEmbedsSettings {
	/** Also draw a block embed that is alone on its line inline (rule 3). */
	drawAll: boolean;
	/** The look of the inline text. */
	style: EmbedStyle;
}

export const STYLES: Record<EmbedStyle, string> = {
	underline: 'Dotted underline',
	background: 'Soft background',
	none: 'None',
};

export const DEFAULT_SETTINGS: InlineBlockEmbedsSettings = {
	drawAll: false,
	style: 'underline',
};

/** Fills gaps and drops bad values from saved data, so old or hand-edited data.json never breaks the plugin. */
export function normalizeSettings(saved: Partial<InlineBlockEmbedsSettings> | null | undefined): InlineBlockEmbedsSettings {
	const s = saved ?? {};
	return {
		drawAll: typeof s.drawAll === 'boolean' ? s.drawAll : DEFAULT_SETTINGS.drawAll,
		style: typeof s.style === 'string' && s.style in STYLES ? s.style : DEFAULT_SETTINGS.style,
	};
}

/** All supported block kinds are available; appearance follows the user's settings. */
export function effectiveOptions(settings: InlineBlockEmbedsSettings): Options {
	return {
		drawAll: settings.drawAll,
		listItems: true,
		style: settings.style,
	};
}

export class InlineBlockEmbedsSettingTab extends PluginSettingTab {
	plugin: InlineBlockEmbedsPlugin;

	constructor(app: ConstructorParameters<typeof PluginSettingTab>[0], plugin: InlineBlockEmbedsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return this.productSettingDefinitions();
	}

	productSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Draw every block embed inline',
				desc: 'Also draw a block embed that is alone on its line as inline text. When this is off, only an embed with other text on its line is inline.',
				control: { type: 'toggle', key: 'drawAll', defaultValue: DEFAULT_SETTINGS.drawAll },
			},
			{
				name: 'Inline style',
				desc: 'How the inline text looks.',
				control: { type: 'dropdown', key: 'style', defaultValue: DEFAULT_SETTINGS.style, options: { ...STYLES } },
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		await super.setControlValue(key, value);
		this.plugin.settings = normalizeSettings(this.plugin.settings);
		this.plugin.redrawAll();
	}
}
