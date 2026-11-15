import { Arguments } from '../../src/api.js';
import { Command } from '../../src/api.js';
import type { Editor } from '../../src/api.js';

export class CanvasCommand extends Command {
  override get syntax(): string { return 'canvas [w] [h]'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    const args = new Arguments(values, this.syntax);
    if (values.length === 0) return [editor.canvas()];
    args.count(2);
    return [editor.canvas(args.number(0, 'width'), args.number(1, 'height'))];
  }
}
