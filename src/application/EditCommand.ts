import { SvgDocument } from '../domain/SvgDocument.js';
import { Arguments } from './Arguments.js';
import { Command } from './Command.js';
import type { Editor } from './Editor.js';

/** Command + Memento. The receiver is a detached document until execution succeeds. */
export abstract class EditCommand extends Command {
  private before: SvgDocument | undefined;
  private after: SvgDocument | undefined;
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    return [editor.edit(this, new Arguments(values, this.syntax))];
  }
  execute(document: SvgDocument, args: Arguments): { document: SvgDocument; message: string } {
    const working = document.clone();
    const message = this.apply(working, args);
    this.before = document.clone();
    this.after = working.clone();
    return { document: working, message };
  }
  undo(): SvgDocument {
    if (!this.before) throw new Error('command has not executed');
    return this.before.clone();
  }
  redo(): SvgDocument {
    if (!this.after) throw new Error('command has not executed');
    return this.after.clone();
  }
  protected abstract apply(document: SvgDocument, args: Arguments): string;
}
