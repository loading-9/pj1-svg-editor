import test from 'node:test';
import assert from 'node:assert/strict';
import {DirPlugin} from '../plugins/dir/DirPlugin.js';
import type {DirectoryReader,DirectoryEntry} from '../plugins/dir/DirectoryReader.js';
import {Defaults} from '../src/host/Defaults.js';
import {PluginLoader} from '../src/host/PluginLoader.js';
import {Editor} from '../src/api.js';
import {CommandRegistry} from '../src/application/CommandRegistry.js';
import {MemoryStore} from './MemoryStore.js';
class StubDirectory implements DirectoryReader {
  fail=false;
  constructor(public items:DirectoryEntry[]=[]) {}
  currentDirectory():string {return '/fixed';}
  entries():DirectoryEntry[]{if(this.fail)throw Error('denied');return this.items;}
}
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
