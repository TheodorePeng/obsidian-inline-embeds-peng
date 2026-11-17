import { build } from 'esbuild';
import { describe, expect, it } from 'vitest';
import manifest from '../manifest.json';

// Check the transitive production graph, rather than merely checking one permission function.
describe('Independent runtime', () => {
	it('has its own identity and preserves the platform/API floor', () => {
		expect(manifest).toMatchObject({ id: 'inline-embeds-peng', name: 'Inline Embeds Peng', minAppVersion: '1.13.4', isDesktopOnly: false });
		expect(manifest).not.toHaveProperty('fundingUrl');
	});

	it('does not bundle account, network licensing or promotional modules', async () => {
		const result = await build({ entryPoints: ['src/main.ts'], bundle: true, packages: 'external', platform: 'node', format: 'cjs', write: false, metafile: true });
		expect(Object.keys(result.metafile!.inputs).filter((path) => /src\/(license|hello)\/|src\/pro\.ts|src\/core\/hello\.ts|whats-new\.json/.test(path))).toEqual([]);
		expect(result.outputFiles[0]!.text).not.toMatch(/api\.github\.com\/graphql|login\/device|Ov23lic5UPGPZqhBlBGg|notemods-hello|github-token/);
	});
});
