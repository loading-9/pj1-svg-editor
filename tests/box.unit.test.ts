import test from 'node:test';
import assert from 'node:assert/strict';
import {GeometryShape} from '../src/api.js';
import type {PluginContext,ShapeProvider,AttributeHandler,TreeDecorator,Shape} from '../src/api.js';
import {BoxPlugin} from '../plugins/box/BoxPlugin.js';
import {Box} from '../plugins/box/Box.js';
class FixtureLeaf extends GeometryShape {
  private text='';
  constructor(id:string,private readonly tag:string){super(id,tag==='rect'?['x','y','width','height']:['x','y'],['x'],['y'],tag==='rect'?['width','height']:[],'fill');}
  override get type():string{return this.tag;}
  override get content():string|undefined{return this.tag==='text'?this.text:undefined;}
  override setAttribute(attr:string,value:string):void{if(attr==='text')this.text=value;else super.setAttribute(attr,value);}
  override initialize(args:readonly string[]):void{if(this.tag==='text'){super.initialize(args.slice(0,2));this.text=args[2]!;}else super.initialize(args);}
  override summary():string{return this.label;}
  override clone():Shape{const copy=new FixtureLeaf(this.id,this.tag);this.copyBaseTo(copy);copy.text=this.text;return copy;}
}
test('box independently registers all three roles and uses only public shape construction context',()=>{
 let provider:ShapeProvider|undefined,handler:AttributeHandler|undefined,decorator:TreeDecorator|undefined;
 const context={registerShape:(p:ShapeProvider)=>provider=p,registerAttribute:(h:AttributeHandler)=>handler=h,registerDecorator:(d:TreeDecorator)=>decorator=d,createShape:(type:string,id:string,args:readonly string[])=>{const shape=new FixtureLeaf(id,type);shape.initialize(args);return shape;}} as unknown as PluginContext;
 new BoxPlugin().activate(context,{fill:'orange'});const box=provider!.create('n',['10','20','30','40','标题']) as Box;
 assert.deepEqual(box.children.map(s=>s.id),['n-rect','n-label']);assert.equal(box.frame.attributes().get('fill'),'orange');
 assert.equal(box.title.attributes().get('x'),'30');assert.equal(box.title.attributes().get('y'),'55');
 assert.equal(handler!.handles(box,'label'),true);handler!.apply(box,'label','new',{} as never);assert.equal(box.title.content,'new');
 assert.equal(decorator!.decorate(box,{} as never),'(box)');assert.equal(decorator!.decorate(undefined,{} as never),'');
 assert.throws(()=>box.remove(box.frame),/cannot detach required box part/);assert.equal(box.clone().title.content,'new');
});
