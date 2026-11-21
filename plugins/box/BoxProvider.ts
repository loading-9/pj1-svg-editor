import { Numbers } from '../../src/api.js';
import type { ShapeProvider,PluginContext,Shape } from '../../src/api.js';
import { Box } from './Box.js';
export class BoxProvider implements ShapeProvider {
  readonly name='box'; readonly priority=10;
  readonly syntax='create box <id> <x> <y> <w> <h> "<标题>" [in <containerId>]';
  constructor(private readonly context:Pick<PluginContext,'createShape'>,private readonly fill:string) {}
  create(id:string,args:readonly string[]):Box {
    if(args.length!==5)throw new Error('invalid parameters for box');
    const [x,y,w,h]=args.slice(0,4).map((v,i)=>Numbers.parse(v,['x','y','width','height'][i]!));
    Numbers.nonNegative(w!,'width');Numbers.nonNegative(h!,'height');
    const box=new Box(id);
    box.insert(this.context.createShape('rect',id+'-rect',[String(x),String(y),String(w),String(h),this.fill]));
    box.insert(this.context.createShape('text',id+'-label',[String(Numbers.finite(x!+20,'x')),String(Numbers.finite(y!+35,'y')),args[4]!]));
    box.validate();return box;
  }
  accepts(tag:string,attrs:ReadonlyMap<string,string>):boolean {return tag==='g'&&attrs.get('data-kind')==='box';}
  read(id:string,attrs:ReadonlyMap<string,string>,_content:string):Shape {const box=new Box(id);box.importAttributes(attrs);return box;}
}
