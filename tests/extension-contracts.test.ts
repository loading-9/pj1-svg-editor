import test from 'node:test';
import assert from 'node:assert/strict';
import { Editor,TreeRenderer } from '../src/api.js';
import type { TreeDecorator } from '../src/api.js';
import { Extensions } from '../src/application/Extensions.js';
import { ShapeFactory } from '../src/application/ShapeFactory.js';
import { Defaults } from '../src/host/Defaults.js';
import { PluginLoader } from '../src/host/PluginLoader.js';
import { CommandRegistry } from '../src/application/CommandRegistry.js';
import { StatsPlugin } from '../plugins/stats/StatsPlugin.js';
import { DirPlugin } from '../plugins/dir/DirPlugin.js';
import { MemoryStore } from './MemoryStore.js';
test('optional commands disable independently; registered stats/help leave history and redo intact',()=>{
 const e=Defaults.extensions(),editor=new Editor(new MemoryStore()),commands=new CommandRegistry(e),run=(...args:string[])=>commands.run(editor,args).lines;
 assert.throws(()=>run('stats'),/unknown command: stats/);assert.throws(()=>run('dir'),/unknown command: dir/);
 assert.ok(run('help').every(l=>l!=='stats'&&l!=='dir'));
 const loader=new PluginLoader(e,m=>{throw Error(m);});loader.activate(new StatsPlugin(),{name:'stats',contributes:{commands:['stats']}});
 assert.throws(()=>run('dir'),/unknown command: dir/);assert.ok(run('help').includes('stats'));
 run('init');run('create','g','a');run('create','rect','r','1','2','3','4','in','a');run('undo');const before=editor.document.fingerprint();run('stats');run('help');assert.equal(editor.document.fingerprint(),before);run('redo');assert.equal(editor.document.count,2);
 loader.activate(new DirPlugin({currentDirectory:()=>'/x',entries:()=>[]}),{name:'dir',contributes:{commands:['dir']}});assert.deepEqual(run('dir'),['(empty directory)']);
});
test('no provider has explicit unknown fallback and wrong-id/read ambiguity reports errors',()=>{
 const e=new Extensions(),factory=new ShapeFactory(e);assert.throws(()=>factory.create('absent','x',[]),/unknown shape type/);
 const builtin=Defaults.extensions().shapes.get('g')!;
 e.shapes.set('wrong',{...builtin,name:'wrong',priority:0,syntax:'wrong',accepts:()=>true,create:()=>builtin.create('not-x',[]),read:()=>builtin.create('not-x',[])});
 assert.throws(()=>factory.create('wrong','x',[]),/wrong id/);assert.throws(()=>factory.read('g','x',new Map(),''),/wrong id/);
 e.shapes.set('other',{...builtin,name:'other',syntax:'other',priority:0,accepts:()=>true,create:(id,a)=>builtin.create(id,a),read:(id,a,t)=>builtin.read(id,a,t)});
 assert.throws(()=>factory.read('g','x',new Map(),''),/ambiguous shape readers/);
});
test('decorator exceptions, impure output, multiline and bad return types never change live document',()=>{
 const editor=new Editor(new MemoryStore());editor.init(1,2);const before=editor.document.fingerprint();
 const invalid:TreeDecorator[]=[{name:'throws',decorate:()=>{throw Error('decoration failure');}},{name:'mutate',decorate:(_s,v)=>{v.document.resize(30,40);return '';}},{name:'multiline',decorate:()=> 'a\nb'},{name:'bad-type',decorate:()=>undefined as never}];
 for(const decorator of invalid){assert.throws(()=>new TreeRenderer([decorator]).tree(editor.document));assert.equal(editor.document.fingerprint(),before);}
});
