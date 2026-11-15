import test from 'node:test';
import assert from 'node:assert/strict';
import type {PluginContext,ShapeProvider} from '../src/api.js';
import {BuiltinShapes} from '../plugins/builtin-shapes/BuiltinShapes.js';
test('builtin shapes plugin independently registers and creates/reads all six providers',()=>{
 const providers=new Map<string,ShapeProvider>();new BuiltinShapes().activate({registerShape:(p:ShapeProvider)=>{providers.set(p.name,p);}} as PluginContext);
 assert.deepEqual([...providers.keys()],['rect','circle','ellipse','line','text','g']);
 const inputs:Record<string,string[]>={rect:['1','2','3','4'],circle:['1','2','3'],ellipse:['1','2','3','4'],line:['1','2','3','4'],text:['1','2','标题'],g:[]};
 for(const [name,provider]of providers){const shape=provider.create('id',inputs[name]!);assert.equal(shape.type,name);assert.equal(provider.accepts(name,new Map()),true);const copy=provider.read('id',shape.attributes(),shape.content??'');assert.equal(copy.fingerprint(),shape.fingerprint());}
});
