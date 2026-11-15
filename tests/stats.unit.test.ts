import test from 'node:test';
import assert from 'node:assert/strict';
import { Shape,Group,SvgDocument } from '../src/api.js';
import type { Editor,PluginContext,CommandProvider } from '../src/api.js';
import { StatsPlugin } from '../plugins/stats/StatsPlugin.js';
class Leaf extends Shape {
  constructor(id:string,private readonly kind:string){super(id);}
  override get type():string{return this.kind;}
  override initialize():void{} override move():void{} override scale():void{}
  override summary():string{return this.label;} override clone():Shape{return new Leaf(this.id,this.kind);}
}
test('stats independently counts DFS leaves in first-seen order and containers excluding SVG',()=>{
 let provider:CommandProvider|undefined;new StatsPlugin().activate({registerCommand:(p:CommandProvider)=>{provider=p;}} as PluginContext);
 const command=provider!.create(),document=new SvgDocument();
 assert.deepEqual(command.run({document} as Editor,[]),['(total 0, containers 0)']);
 const group=new Group('outer'),nested=new Group('nested');nested.insert(new Leaf('r','rect'));nested.insert(new Leaf('t','text'));group.insert(nested);group.insert(new Leaf('r2','rect'));document.add(group);document.add(new Leaf('c','circle'));
 const before=document.fingerprint();assert.deepEqual(command.run({document} as Editor,[]),['rect: 2  text: 1  circle: 1  (total 4, containers 2)']);assert.equal(document.fingerprint(),before);
 assert.throws(()=>command.run({document} as Editor,['extra']),/usage:/);
});
