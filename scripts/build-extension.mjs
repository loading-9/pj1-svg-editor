import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
await build({ absWorkingDir: root, entryPoints: ['vscode-extension/src/extension.ts'], outfile: 'vscode-extension/dist/extension.js', bundle: true, platform: 'node', format: 'cjs', external: ['vscode'], sourcemap: true, target: 'node18' });
console.log('Built standalone VSCode extension (vscode API remains provided by the host).');
