import { Command } from './Command.js';
import type { Editor } from './Editor.js';
import { AddToCommand } from './commands/AddToCommand.js';
import { CanvasCommand } from './commands/CanvasCommand.js';
import { CreateCommand } from './commands/CreateCommand.js';
import { DeleteCommand } from './commands/DeleteCommand.js';
import { GroupCommand } from './commands/GroupCommand.js';
import { HelpCommand } from './commands/HelpCommand.js';
import { InitCommand } from './commands/InitCommand.js';
import { MoveCommand } from './commands/MoveCommand.js';
import { ReadCommand } from './commands/ReadCommand.js';
import { RedoCommand } from './commands/RedoCommand.js';
import { SaveCommand } from './commands/SaveCommand.js';
import { ScaleCommand } from './commands/ScaleCommand.js';
import { SetCommand } from './commands/SetCommand.js';
import { ShowCommand } from './commands/ShowCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { UndoCommand } from './commands/UndoCommand.js';
import { UngroupCommand } from './commands/UngroupCommand.js';
import { ZOrderCommand } from './commands/ZOrderCommand.js';

/** Name dispatch location #1. Every execution gets its own Command/Memento. */
export class CommandRegistry {
  private readonly factories = new Map<string, () => Command>([
    ['init', () => new InitCommand()], ['read', () => new ReadCommand()],
    ['save', () => new SaveCommand()], ['canvas', () => new CanvasCommand()],
    ['create', () => new CreateCommand()], ['delete', () => new DeleteCommand()],
    ['move', () => new MoveCommand()], ['scale', () => new ScaleCommand()],
    ['set', () => new SetCommand()], ['group', () => new GroupCommand()],
    ['ungroup', () => new UngroupCommand()], ['addto', () => new AddToCommand()],
    ['front', () => new ZOrderCommand(true)], ['back', () => new ZOrderCommand(false)],
    ['tree', () => new TreeCommand()], ['show', () => new ShowCommand()],
    ['undo', () => new UndoCommand()], ['redo', () => new RedoCommand()],
    ['help', () => new HelpCommand(this.help())],
  ]);
  private help(): string[] {
    return [
      ...[...this.factories].filter(([name]) => name !== 'help').map(([, create]) => create().syntax),
      'help', 'exit (or quit; EOF also exits)',
      'create rect <id> <x> <y> <w> <h> [fill] [in <containerId>]',
      'create circle <id> <cx> <cy> <r> [fill] [in <containerId>]',
      'create ellipse <id> <cx> <cy> <rx> <ry> [fill] [in <containerId>]',
      'create line <id> <x1> <y1> <x2> <y2> [stroke] [in <containerId>]',
      'create text <id> <x> <y> "content" [in <containerId>]',
      'create g <id> [in <containerId>]',
      'set: fill / stroke / stroke-width; geometry attributes; text content via text',
      'Double-quote arguments containing spaces. Lines beginning with # are comments.',
    ];
  }
  run(editor: Editor, tokens: readonly string[]): readonly string[] {
    const name = tokens[0];
    if (name === undefined) return [];
    const create = this.factories.get(name);
    if (!create) throw new Error(`unknown command: ${name}`);
    return create().run(editor, tokens.slice(1));
  }
}
