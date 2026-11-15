import type { Plugin, PluginContext } from '../../src/api.js';
import type { DirectoryReader } from './DirectoryReader.js';
import { NodeDirectoryReader } from './NodeDirectoryReader.js';
import { DirCommand } from './DirCommand.js';
export class DirPlugin implements Plugin {
  constructor(private readonly reader: DirectoryReader = new NodeDirectoryReader()) {}
  activate(ctx: PluginContext): void { ctx.registerCommand({name:'dir',syntax:'dir',create:()=>new DirCommand(this.reader)}); }
}
