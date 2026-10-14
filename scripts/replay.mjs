import { mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// Development utility, not part of the editor's production class model.
mkdirSync('examples/generated', { recursive: true });
const file = process.argv[2] ?? 'examples/flowchart.txt';
const result = spawnSync(process.execPath, ['dist/src/cli/main.js'], {
  input: readFileSync(file, 'utf8'), encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'],
});
if (result.error) throw result.error;
process.stdout.write(result.stdout);
process.exitCode = result.status ?? 1;
