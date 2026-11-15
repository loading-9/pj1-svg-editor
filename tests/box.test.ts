import test from 'node:test';
import assert from 'node:assert/strict';
import { GeometryShape,Editor,TreeRenderer } from '../src/api.js';
import type { PluginContext,ShapeProvider,AttributeHandler,TreeDecorator,Shape } from '../src/api.js';
import { BoxPlugin } from '../plugins/box/BoxPlugin.js';
import { Box } from '../plugins/box/Box.js';
import { Defaults } from '../src/host/Defaults.js';
import { PluginLoader } from '../src/host/PluginLoader.js';
import { CommandRegistry } from '../src/application/CommandRegistry.js';
import { MemoryStore } from './MemoryStore.js';
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
test('box integration: nested containers, attributes each undo/redo, protected parts and subtree ID atomicity',()=>{
 const e=Defaults.extensions(),errors:string[]=[];new PluginLoader(e,m=>errors.push(m)).activate(new BoxPlugin(),{name:'box',contributes:{shapes:['box'],attributes:['box-attributes'],decorators:['box-type-label']}});
 const editor=new Editor(new MemoryStore()),commands=new CommandRegistry(e),run=(...args:string[])=>commands.run(editor,args);
 run('init');run('create','g','outer');run('create','box','n','120','100','160','60','开始','in','outer');
 run('create','box','nested','0','0','40','20','内层','in','n');
 assert.equal(editor.document.find('n').composite,true);run('move','n','0','100');assert.equal(editor.document.find('n-label').attributes().get('y'),'235');run('undo');
 run('set','n','fill','#f5a623');assert.equal(editor.document.find('n-rect').attributes().get('fill'),'#f5a623');run('undo');assert.equal(editor.document.find('n-rect').attributes().get('fill'),'#4a90d9');run('redo');
 run('set','n','label','处理数据 v2');assert.equal(editor.document.find('n-label').content,'处理数据 v2');run('undo');assert.equal(editor.document.find('n-label').content,'开始');run('redo');
 for(const args of [['ungroup','n'],['delete','n-label'],['addto','outer','n-rect'],['group','bad','n-label','nested']]){
  const before=editor.document.fingerprint();assert.throws(()=>run(...args),/cannot (ungroup composite shape|detach required box part)/);assert.equal(editor.document.fingerprint(),before);
 }
 run('create','rect','collision-label','0','0','1','1');const before=editor.document.fingerprint();
 assert.throws(()=>run('create','box','collision','0','0','2','2','x'),/id already exists: collision-label/);assert.equal(editor.document.fingerprint(),before);
 assert.throws(()=>run('set','collision-label','label','x'),/unknown attribute: label/);
 assert.ok(new TreeRenderer([...e.decorators.values()]).tree(editor.document).some(line=>line.includes('g#n')&&line.endsWith('(box)')));
 run('delete','n');assert.equal(editor.document.count,2);run('undo');assert.ok(editor.document.find('n-label'));assert.deepEqual(errors,[]);
});
test('box read validates structure, rejects duplicate IDs, preserves previous state, and downgrades without plugin',()=>{
 const e=Defaults.extensions();new PluginLoader(e,m=>{throw Error(m);}).activate(new BoxPlugin(),{name:'box',contributes:{shapes:['box'],attributes:['box-attributes'],decorators:['box-type-label']}});
 const codec=Defaults.codec(e),base=Defaults.codec();
 const valid='<svg><g id="n" data-kind="box"><rect id="n-rect" width="10" height="20"/><text id="n-label">hi</text></g></svg>';
 const document=codec.decode(valid).document;assert.equal(document.find('n').composite,true);assert.equal(codec.decode(codec.encode(document)).document.find('n').composite,true);
 assert.equal(base.decode(valid).document.find('n').composite,false);
 for(const bad of [valid.replace('<text id="n-label">hi</text>',''),valid.replace('id="n-label"','id="n-rect"'),valid.replace('<rect id="n-rect" width="10" height="20"/>','<g id="n-rect"/>')])assert.throws(()=>codec.decode(bad),/invalid box|id already exists/);
 const store={read:()=>codec.decode(valid.replace('id="n-label"','id="wrong"')),write:()=>{}},editor=new Editor(store);editor.init(12,34);const before=editor.document.fingerprint();assert.throws(()=>editor.read('bad.svg'),/invalid box/);assert.equal(editor.document.fingerprint(),before);
});
