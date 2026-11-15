import type { Plugin,PluginContext } from '../../src/api.js';
import { ModifiedStar } from './ModifiedStar.js';
export class ModifiedStarPlugin implements Plugin {
  activate(ctx:PluginContext):void {ctx.registerDecorator(new ModifiedStar());}
}
