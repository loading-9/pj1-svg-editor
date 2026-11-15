import { Editor } from '../application/Editor.js';
import { CommandRegistry } from '../application/CommandRegistry.js';
import { Defaults } from '../host/Defaults.js';
import { PluginLoader } from '../host/PluginLoader.js';
import { codePlugins } from '../host/codePlugins.js';
import { Repl } from './Repl.js';

// Composition root: the sole executable top-level wiring, with no domain logic.
const extensions = Defaults.extensions();
const report = (message: string): void => { process.stdout.write(message + '\n'); };
const loader = new PluginLoader(extensions, report);
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--code') {
  codePlugins.forEach(entry => loader.activate(entry.plugin, entry.manifest, entry.options));
} else if (args.length === 2 && args[0] === '--config') loader.config(args[1]!);
else if (args.length) report('error: usage: cli [--code | --config <file>]');
const repl = new Repl(new Editor(Defaults.store(extensions)), new CommandRegistry(extensions));
void repl.start(process.stdin, process.stdout, Boolean(process.stdin.isTTY && process.stdout.isTTY)).catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`error: ${message.replace(/[\r\n]+/g, ' ')}\n`);
  process.exitCode = 1;
});
