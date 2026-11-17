// Obsidian creates/unlinks a shared CLI socket even with cli=false. Never run beside a user instance.
import ObsidianWorkerService, { launcher } from 'wdio-obsidian-service';
import { SevereServiceError } from 'webdriverio';
import { access, readFile, realpath, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import os from 'node:os';

export { launcher };

export default class IsolatedObsidianService extends ObsidianWorkerService {
	async beforeSession(...args: Parameters<ObsidianWorkerService['beforeSession']>): Promise<void> {
		// Fail before preparing or launching an app. cli=false alone does not isolate the socket.
		try {
			await access(path.join(os.homedir(), '.obsidian-cli.sock'));
			throw new SevereServiceError('A shared Obsidian CLI socket exists. Close the user instance before E2E.');
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		}
		if (process.platform === 'win32') throw new SevereServiceError('Shared-instance detection is not implemented for Windows.');
		try {
			const { stdout } = await promisify(execFile)('pgrep', ['-x', 'Obsidian|obsidian']);
			if (stdout.trim()) throw new SevereServiceError('An Obsidian process is already running. Refusing concurrent E2E.');
		} catch (error) {
			if ((error as { code?: number }).code !== 1) throw error;
		}
		await super.beforeSession(...args);
		try {
			const cap = args[1] as { 'goog:chromeOptions'?: { args?: string[] } };
			const arg = cap['goog:chromeOptions']?.args?.find((s) => s.startsWith('--user-data-dir='));
			if (!arg) throw new Error('Missing test user-data directory; refusing to launch.');
			const directory = await realpath(arg.slice('--user-data-dir='.length));
			const temporaryRoot = await realpath(os.tmpdir());
			if (!directory.startsWith(temporaryRoot + path.sep) || !path.basename(directory).startsWith('obsidian-launcher-config-')) throw new Error('Not an owned temporary Obsidian config directory.');
			const file = path.join(directory, 'obsidian.json');
			const config = JSON.parse(await readFile(file, 'utf8')) as Record<string, unknown>;
			config.cli = false;
			await writeFile(file, JSON.stringify(config));
			if ((JSON.parse(await readFile(file, 'utf8')) as { cli: boolean }).cli !== false) throw new Error('Test CLI isolation was not applied.');
		} catch (error) {
			throw new SevereServiceError(`Refusing unsafe test launch: ${String(error)}`);
		}
	}
}
