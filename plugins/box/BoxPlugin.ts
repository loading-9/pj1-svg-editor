import type { Plugin,PluginContext } from '../../src/api.js';
import { BoxProvider } from './BoxProvider.js';
import { BoxAttributes } from './BoxAttributes.js';
import { BoxTypeLabel } from './BoxTypeLabel.js';
export class BoxPlugin implements Plugin {
  activate(ctx:PluginContext,options?:unknown):void {
    let fill='#4a90d9';
    if(options!==undefined){
      if(!options||typeof options!=='object'||!('fill' in options)||typeof options.fill!=='string')throw new Error('box options require string fill');
      fill=options.fill;
    }
    ctx.registerShape(new BoxProvider(ctx,fill));ctx.registerAttribute(new BoxAttributes());ctx.registerDecorator(new BoxTypeLabel());
  }
}
