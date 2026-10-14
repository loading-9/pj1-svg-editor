import { Arguments } from '../Arguments.js';
import { Command } from '../Command.js';
import type { Editor } from '../Editor.js';

export class InitCommand extends Command {
  override get syntax(): string { return 'init [w] [h]'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    const args = new Arguments(values, this.syntax); args.count(0, 2);
    return [editor.init(args.length > 0 ? args.number(0, 'width') : 800, args.length > 1 ? args.number(1, 'height') : 600)];
  }
}
