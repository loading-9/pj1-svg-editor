import test from 'node:test';
import assert from 'node:assert/strict';
import { Editor } from '../src/api.js';
import type { AttributeHandler,Shape,SvgDocument } from '../src/api.js';
import { Defaults } from '../src/host/Defaults.js';
import { CommandRegistry } from '../src/application/CommandRegistry.js';
import { MemoryStore } from './MemoryStore.js';
class MultiPart implements AttributeHandler {
 readonly name='multi';handles(_shape:Shape,attr:string):boolean{return attr==='multi';}
 apply(shape:Shape,_attr:string,value:string,document:SvgDocument):void{shape.setAttribute('fill',value);document.find('b').setAttribute('fill',value);}
}
class Throwing implements AttributeHandler {
 readonly name='throws';handles(_shape:Shape,attr:string):boolean{return attr==='fail';}
 apply(shape:Shape):void{shape.setAttribute('fill','partial');throw Error('handler failed');}
}
test('attribute extension multi-part set is one undo unit; conflict and partial failure preserve document/redo',()=>{
 const e=Defaults.extensions(),editor=new Editor(new MemoryStore()),commands=new CommandRegistry(e),run=(...args:string[])=>commands.run(editor,args);
 run('init');run('create','g','a');run('create','g','b');e.attributes.set('multi',new MultiPart());e.attributes.set('throws',new Throwing());
 run('set','a','multi','red');assert.equal(editor.document.find('b').attributes().get('fill'),'red');run('undo');assert.equal(editor.document.find('a').attributes().has('fill'),false);assert.equal(editor.document.find('b').attributes().has('fill'),false);run('redo');run('undo');
 const before=editor.document.fingerprint();assert.throws(()=>run('set','a','fail','x'),/handler failed/);assert.equal(editor.document.fingerprint(),before);
 e.attributes.set('collision',{name:'collision',handles:(_s,a)=>a==='multi',apply:()=>{throw Error('must not execute');}});
 assert.throws(()=>run('set','a','multi','blue'),/ambiguous attribute handlers: multi, collision/);assert.equal(editor.document.fingerprint(),before);
 run('redo');assert.equal(editor.document.find('b').attributes().get('fill'),'red');
 run('set','a','stroke','black');assert.equal(editor.document.find('a').attributes().get('stroke'),'black');assert.throws(()=>run('set','a','undefined','x'),/unknown attribute: undefined/);
});
test('mutating handles is rejected and has no observable document or history effects',()=>{
 const e=Defaults.extensions(),editor=new Editor(new MemoryStore()),commands=new CommandRegistry(e),run=(...args:string[])=>commands.run(editor,args);
 run('init');run('create','g','a');const before=editor.document.fingerprint();
 e.attributes.set('impure',{name:'impure',handles:s=>{s.setAttribute('fill','bad');return false;},apply:()=>{}});
 assert.throws(()=>run('set','a','fill','green'),/mutated during handles/);assert.equal(editor.document.fingerprint(),before);run('undo');assert.equal(editor.document.count,0);
});
