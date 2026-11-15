import type { Plugin, PluginContext, Command } from '../../src/api.js';
import { InitCommand } from './InitCommand.js';
import { ReadCommand } from './ReadCommand.js';
import { SaveCommand } from './SaveCommand.js';
import { CanvasCommand } from './CanvasCommand.js';
import { CreateCommand } from './CreateCommand.js';
import { DeleteCommand } from './DeleteCommand.js';
import { MoveCommand } from './MoveCommand.js';
import { ScaleCommand } from './ScaleCommand.js';
import { SetCommand } from './SetCommand.js';
import { GroupCommand } from './GroupCommand.js';
import { UngroupCommand } from './UngroupCommand.js';
import { AddToCommand } from './AddToCommand.js';
import { ZOrderCommand } from './ZOrderCommand.js';
import { TreeCommand } from './TreeCommand.js';
import { ShowCommand } from './ShowCommand.js';
import { UndoCommand } from './UndoCommand.js';
import { RedoCommand } from './RedoCommand.js';
import { HelpCommand } from './HelpCommand.js';
import { ExitCommand } from './ExitCommand.js';

export class BuiltinCommands implements Plugin {
  activate(ctx: PluginContext): void {
    const register = (name: string, create: () => Command): void => { ctx.registerCommand({name, syntax:create().syntax, create}); };
    register('init',()=>new InitCommand()); register('read',()=>new ReadCommand());
    register('save',()=>new SaveCommand()); register('canvas',()=>new CanvasCommand());
    register('create',()=>new CreateCommand({create:(type,id,args)=>ctx.createShape(type,id,args)}));
    register('delete',()=>new DeleteCommand()); register('move',()=>new MoveCommand());
    register('scale',()=>new ScaleCommand()); register('set',()=>new SetCommand(ctx));
    register('group',()=>new GroupCommand()); register('ungroup',()=>new UngroupCommand());
    register('addto',()=>new AddToCommand()); register('front',()=>new ZOrderCommand(true));
    register('back',()=>new ZOrderCommand(false)); register('tree',()=>new TreeCommand(ctx));
    register('show',()=>new ShowCommand(ctx)); register('undo',()=>new UndoCommand());
    register('redo',()=>new RedoCommand()); register('help',()=>new HelpCommand([...ctx.help()]));
    register('exit',()=>new ExitCommand()); register('quit',()=>new ExitCommand());
  }
}
