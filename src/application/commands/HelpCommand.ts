import { Arguments } from '../Arguments.js';
import { Command } from '../Command.js';
import type { Editor } from '../Editor.js';

export class HelpCommand extends Command {
  constructor(private readonly lines: readonly string[]) { super(); }
  override get syntax(): string { return 'help'; }
  override run(_editor: Editor, values: readonly string[]): readonly string[] {
    new Arguments(values, this.syntax).count(0); return this.lines;
  }
}
