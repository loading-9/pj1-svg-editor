import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DirCommand } from '../plugins/dir/DirCommand.js';
import { DirPlugin } from '../plugins/dir/DirPlugin.js';
import { NodeDirectoryReader } from '../plugins/dir/NodeDirectoryReader.js';
import type { DirectoryReader,DirectoryEntry } from '../plugins/dir/DirectoryReader.js';
import type { PluginContext,CommandProvider } from '../src/api.js';
import type {EditorContext as Editor} from '../src/api.js';
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
