import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DirCommand } from '../plugins/dir/DirCommand.js';
import { DirPlugin } from '../plugins/dir/DirPlugin.js';
import { NodeDirectoryReader } from '../plugins/dir/NodeDirectoryReader.js';
import type { DirectoryReader,DirectoryEntry } from '../plugins/dir/DirectoryReader.js';
import { Defaults } from '../src/host/Defaults.js';
import { PluginLoader } from '../src/host/PluginLoader.js';
import { Editor } from '../src/api.js';
import type { PluginContext,CommandProvider } from '../src/api.js';
import { CommandRegistry } from '../src/application/CommandRegistry.js';
import { MemoryStore } from './MemoryStore.js';
class StubDirectory implements DirectoryReader {
  fail=false;
  constructor(public items:DirectoryEntry[]=[]) {}
  currentDirectory():string {return '/fixed';}
  entries():DirectoryEntry[]{if(this.fail)throw Error('denied');return this.items;}
}
test('dir independently uses directory port: mixed items, hidden entries, stable sorting, empty and failure',()=>{
  const reader=new StubDirectory([{name:'z',kind:'file'},{name:'b',kind:'directory'},{name:'.hidden',kind:'file'},{name:'a',kind:'directory'},{name:'link',kind:'link'},{name:'pipe',kind:'other'}]);
  let provider:CommandProvider|undefined;
  new DirPlugin(reader).activate({registerCommand:(p:CommandProvider)=>{provider=p;}} as PluginContext);
  assert.equal(provider!.name,'dir'); const command=provider!.create();
  const expected=['[DIR]  a','[DIR]  b','[FILE]  .hidden','[FILE]  z','[LINK]  link','[OTHER]  pipe'];
  assert.deepEqual(command.run({} as Editor,[]),expected);reader.items.reverse();assert.deepEqual(command.run({} as Editor,[]),expected);
  assert.throws(()=>command.run({} as Editor,['extra']),/usage:/);
  reader.items=[];assert.deepEqual(command.run({} as Editor,[]),['(empty directory)']);
  reader.fail=true;assert.throws(()=>command.run({} as Editor,[]),/^Error: cannot read directory: \/fixed$/);
});
test('dir real adapter lists direct children and reports IO failure without changing cwd',()=>{
 const directory=mkdtempSync(join(tmpdir(),'svg-dir-')),cwd=process.cwd();
 try {
  mkdirSync(join(directory,'folder'));writeFileSync(join(directory,'z.svg'),'');writeFileSync(join(directory,'.hidden'),'');
  const real=new NodeDirectoryReader();
  const port:DirectoryReader={currentDirectory:()=>directory,entries:path=>real.entries(path)};
  assert.deepEqual(new DirCommand(port).run({} as Editor,[]),['[DIR]  folder','[FILE]  .hidden','[FILE]  z.svg']);
  assert.equal(real.currentDirectory(),cwd);assert.throws(()=>new DirCommand({currentDirectory:()=>join(directory,'missing'),entries:p=>real.entries(p)}).run({} as Editor,[]),/cannot read directory:/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});
test('dir works before init and success/failure preserve document, saved snapshot, history and redo',()=>{
 const extensions=Defaults.extensions(),reader=new StubDirectory(),errors:string[]=[];
 new PluginLoader(extensions,m=>errors.push(m)).activate(new DirPlugin(reader),{name:'dir-test',contributes:{commands:['dir']}});
 const commands=new CommandRegistry(extensions),editor=new Editor(new MemoryStore());
 const run=(...tokens:string[])=>commands.run(editor,tokens).lines;
 assert.deepEqual(run('dir'),['(empty directory)']);run('init');run('create','g','g');run('move','g','1','2');run('undo');
 const before=editor.document.fingerprint(),saved=editor.saved!.fingerprint(),cwd=process.cwd();
 run('dir');reader.fail=true;assert.throws(()=>run('dir'),/cannot read directory/);
 assert.equal(editor.document.fingerprint(),before);assert.equal(editor.saved!.fingerprint(),saved);assert.equal(process.cwd(),cwd);
 run('redo');run('undo');run('undo');assert.equal(editor.document.count,0);assert.deepEqual(errors,[]);
});
