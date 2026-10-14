import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';
import type { EditCommand } from './EditCommand.js';

export class History {
  private readonly undoStack: EditCommand[] = [];
  private readonly redoStack: EditCommand[] = [];
  private ioBarrier = true;

  execute(command: EditCommand, document: SvgDocument, args: Arguments): { document: SvgDocument; message: string } {
    const result = command.execute(document, args);
    this.undoStack.push(command);
    this.redoStack.length = 0;
    this.ioBarrier = false;
    return result;
  }
  afterIo(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.ioBarrier = true;
  }
  undo(): { document: SvgDocument; message: string } {
    this.assertAllowed();
    const command = this.undoStack.at(-1);
    if (!command) throw new Error('nothing to undo');
    const document = command.undo();
    this.undoStack.pop(); this.redoStack.push(command);
    return { document, message: `undone: ${command.syntax.split(' ')[0]}` };
  }
  redo(): { document: SvgDocument; message: string } {
    this.assertAllowed();
    const command = this.redoStack.at(-1);
    if (!command) throw new Error('nothing to redo');
    const document = command.redo();
    this.redoStack.pop(); this.undoStack.push(command);
    return { document, message: `redone: ${command.syntax.split(' ')[0]}` };
  }
  private assertAllowed(): void {
    if (this.ioBarrier) throw new Error('undo not allowed after io command');
  }
}
