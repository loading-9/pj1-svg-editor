import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Node 20 accepts a test directory; Node 22 treats it as a module path.
// Explicit file discovery also avoids shell glob differences on Windows.
const files = readdirSync('dist/tests').filter(name => name.endsWith('.test.js')).sort().map(name => join('dist/tests', name));
if (!files.length) throw new Error('No compiled test files found. Run the build first.');
const flags = process.argv.includes('--coverage') ? ['--experimental-test-coverage'] : [];
const result = spawnSync(process.execPath, [...flags, '--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
