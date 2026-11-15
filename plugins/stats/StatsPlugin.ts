import type { Plugin, PluginContext } from '../../src/api.js';
import { StatsCommand } from './StatsCommand.js';
export class StatsPlugin implements Plugin {
  activate(ctx: PluginContext): void { ctx.registerCommand({name:'stats',syntax:'stats',create:()=>new StatsCommand()}); }
}
