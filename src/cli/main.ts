import { Editor } from '../application/Editor.js';
import { FileSvgStore } from '../infrastructure/FileSvgStore.js';
import { Repl } from './Repl.js';

// Composition root: the sole executable top-level wiring, with no domain logic.
const repl = new Repl(new Editor(new FileSvgStore()));
void repl.start(process.stdin, process.stdout, Boolean(process.stdin.isTTY && process.stdout.isTTY)).catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`error: ${message.replace(/[\r\n]+/g, ' ')}\n`);
  process.exitCode = 1;
});
