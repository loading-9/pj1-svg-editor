import test from 'node:test';
import assert from 'node:assert/strict';
import { Editor } from '../src/application/Editor.js';
import { CommandRegistry } from '../src/application/CommandRegistry.js';
import { TreeRenderer } from '../src/application/TreeRenderer.js';
import { MemoryStore } from './MemoryStore.js';

test('save without a path keeps the read source after an explicit save-as', () => {
  const store = new MemoryStore(); const editor = new Editor(store);
  editor.read('source.svg');
  editor.save('copy.svg');
  assert.equal(editor.save(), 'saved to source.svg (0 elements)');
  store.fail = true;
  assert.throws(() => editor.read('failed.svg'), /cannot read file/);
  assert.throws(() => editor.save('failed-copy.svg'), /cannot write file/);
  store.fail = false;
  assert.equal(editor.save(), 'saved to source.svg (0 elements)');
  editor.init(100, 100);
  assert.throws(() => editor.save(), /no file path/);
  editor.save('new.svg');
  assert.equal(editor.save(), 'saved to new.svg (0 elements)');
});

test('one command one history entry; branch invalidation and display transparency', () => {
  const editor = new Editor(new MemoryStore()); const registry = new CommandRegistry();
  const run = (...tokens: string[]) => registry.run(editor, tokens);
  run('init'); run('create', 'rect', 'r', '1', '2', '3', '4'); run('move', 'r', '10', '20');
  run('tree'); run('show', 'r'); run('help'); run('canvas');
  run('undo'); assert.equal(editor.document.find('r').attributes().get('x'), '1');
  run('redo'); assert.equal(editor.document.find('r').attributes().get('x'), '11');
  run('undo'); run('set', 'r', 'fill', 'red');
  assert.throws(() => run('redo'), /nothing to redo/);
  run('undo'); assert.equal(editor.document.find('r').attributes().has('fill'), false);
});

test('all IO barriers clear history, and the next edit enables a fresh history', () => {
  const editor = new Editor(new MemoryStore()); const registry = new CommandRegistry();
  const run = (...tokens: string[]) => registry.run(editor, tokens);
  assert.throws(() => run('tree'), /no document/);
  run('help'); run('init'); assert.throws(() => run('undo'), /undo not allowed after io command/);
  run('create', 'g', 'g'); run('save', 'doc.svg');
  assert.throws(() => run('redo'), /undo not allowed after io command/);
  run('set', 'g', 'fill', 'red'); run('undo');
  assert.throws(() => run('undo'), /nothing to undo/);
  run('canvas', '400', '300'); assert.throws(() => run('undo'), /io command/);
  run('read', 'doc.svg'); assert.throws(() => run('redo'), /io command/);
  run('init'); assert.throws(() => run('redo'), /io command/);
});

test('failed edits, IO, and validation preserve document and redo history', () => {
  const store = new MemoryStore(); const editor = new Editor(store); const registry = new CommandRegistry();
  const run = (...tokens: string[]) => registry.run(editor, tokens);
  run('init'); run('create', 'rect', 'r', '1', '2', '3', '4'); run('move', 'r', '1', '1'); run('undo');
  const renderer = new TreeRenderer(); const before = renderer.tree(editor.document);
  for (const command of [
    ['create', 'rect', 'r', '0', '0', '1', '1'], ['create', 'box', 'x'],
    ['scale', 'r', '0'], ['set', 'r', 'width', '-5'], ['set', 'r', 'rx', '3'],
    ['create', 'rect', 'x', '0', '0', '2', '3', 'in', 'r'],
    ['create', 'g', 'x', 'in', 'missing'], ['move', 'r', 'NaN', '0'], ['delete', 'missing'],
    ['canvas', '300', '-5'], ['init', '-2'],
  ]) {
    assert.throws(() => run(...command)); assert.deepEqual(renderer.tree(editor.document), before);
  }
  store.fail = true;
  assert.throws(() => run('save', 'fail.svg')); assert.throws(() => run('read', 'fail.svg'));
  assert.deepEqual(renderer.tree(editor.document), before);
  run('redo'); assert.equal(editor.document.find('r').attributes().get('x'), '2');
});

test('group deletion and nested ungroup are single undo units', () => {
  const editor = new Editor(new MemoryStore()); const registry = new CommandRegistry();
  const run = (...tokens: string[]) => registry.run(editor, tokens);
  run('init'); run('create', 'g', 'scene');
  run('create', 'circle', 'c', '10', '20', '3', 'in', 'scene');
  run('create', 'text', 't', '10', '20', 'hello world', 'in', 'scene');
  const before = new TreeRenderer().tree(editor.document);
  run('group', 'inner', 'c', 't'); run('undo');
  assert.deepEqual(new TreeRenderer().tree(editor.document), before);
  run('redo'); run('ungroup', 'inner'); run('undo');
  assert.deepEqual(editor.document.container('inner').children.map(s => s.id), ['c', 't']);
  run('delete', 'scene'); assert.equal(editor.document.count, 0);
  run('undo'); assert.equal(editor.document.count, 4);
});
