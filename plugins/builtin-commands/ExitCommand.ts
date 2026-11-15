import { Arguments } from '../../src/api.js';
import { Command } from '../../src/api.js';
import type { Editor } from '../../src/api.js';

export class ExitCommand extends Command {
  override get syntax(): string { return 'exit'; }
  override get exits(): boolean { return true; }
  override run(_editor: Editor, values: readonly string[]): readonly string[] {
    new Arguments(values, this.syntax).count(0); return [];
  }
}
