import type { Editor } from './Editor.js';

export abstract class Command {
  abstract get syntax(): string;
  abstract run(editor: Editor, values: readonly string[]): readonly string[];
}
