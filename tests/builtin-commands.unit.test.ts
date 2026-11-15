import test from 'node:test';
import assert from 'node:assert/strict';
import {SvgDocument} from '../src/api.js';
import type {PluginContext,CommandProvider,EditorContext} from '../src/api.js';
import {BuiltinCommands} from '../plugins/builtin-commands/BuiltinCommands.js';
test('builtin command plugin independently composes commands through public services',()=>{
 const providers=new Map<string,CommandProvider>();
 const context={registerCommand:(p:CommandProvider)=>{providers.set(p.name,p);},help:()=>['provided help'],treeDecorators:()=>[],renderTree:()=>['provided tree'],showShape:()=>['provided show']} as unknown as PluginContext;
 new BuiltinCommands().activate(context);assert.equal(providers.size,21);
 for(const provider of providers.values())assert.equal(provider.create().syntax,provider.syntax);
 const editor={document:new SvgDocument(),saved:undefined,edit:()=> 'edited through port'} as unknown as EditorContext;
 assert.deepEqual(providers.get('tree')!.create().run(editor,[]),['provided tree']);
 assert.deepEqual(providers.get('show')!.create().run(editor,['id']),['provided show']);
 assert.deepEqual(providers.get('help')!.create().run(editor,[]),['provided help']);
 assert.deepEqual(providers.get('move')!.create().run(editor,['id','1','2']),['edited through port']);
});
