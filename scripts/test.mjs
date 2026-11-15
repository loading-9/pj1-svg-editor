import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Node 20 accepts a test directory; Node 22 treats it as a module path.
// Explicit file discovery also avoids shell glob differences on Windows.
const names = readdirSync('tests').filter(name => name.endsWith('.test.ts'));
const selected = process.argv.includes('--plugins-only') ? names.filter(name => name.endsWith('.unit.test.ts')) : names;
const pluginIndex = process.argv.indexOf('--plugin');
const filtered = pluginIndex < 0 ? selected : selected.filter(name => name === process.argv[pluginIndex + 1] + '.unit.test.ts');
const files = filtered.sort().map(name => join('dist/tests', name.replace(/\.ts$/, '.js')));
if (!files.length) throw new Error('No compiled test files found. Run the build first.');
const flags = process.argv.includes('--coverage') ? ['--experimental-test-coverage'] : [];
const result = spawnSync(process.execPath, [...flags, '--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
