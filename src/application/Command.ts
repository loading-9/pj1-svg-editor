import type { EditorContext } from './EditorContext.js';

export abstract class Command {
  get exits(): boolean { return false; }
  abstract get syntax(): string;
  abstract run(editor: EditorContext, values: readonly string[]): readonly string[];
}
