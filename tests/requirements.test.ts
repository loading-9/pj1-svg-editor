import test from 'node:test';
import assert from 'node:assert/strict';
import { Editor } from '../src/application/Editor.js';
import { Repl } from '../src/cli/Repl.js';
import { SvgCodec } from '../src/infrastructure/SvgCodec.js';
import { FileSvgStore } from '../src/infrastructure/FileSvgStore.js';
import { MemoryStore } from './MemoryStore.js';

const cases = [
  { type: 'rect', params: '1 2 3 4', moved: { x: '11', y: '22' }, scaled: { x: '2', y: '4', width: '6', height: '8' }, allowed: ['x', 'y', 'width', 'height'] },
  { type: 'circle', params: '1 2 3', moved: { cx: '11', cy: '22' }, scaled: { cx: '2', cy: '4', r: '6' }, allowed: ['cx', 'cy', 'r'] },
  { type: 'ellipse', params: '1 2 3 4', moved: { cx: '11', cy: '22' }, scaled: { cx: '2', cy: '4', rx: '6', ry: '8' }, allowed: ['cx', 'cy', 'rx', 'ry'] },
  { type: 'line', params: '1 2 3 4', moved: { x1: '11', y1: '22', x2: '13', y2: '24' }, scaled: { x1: '2', y1: '4', x2: '6', y2: '8' }, allowed: ['x1', 'y1', 'x2', 'y2'] },
  { type: 'text', params: '1 2 "hello world"', moved: { x: '11', y: '22' }, scaled: { x: '2', y: '4' }, allowed: ['x', 'y'] },
];

for (const shape of cases) {
  test(`${shape.type}: move, scale, exact undo/redo and attribute whitelist`, () => {
    const editor = new Editor(new MemoryStore()); const repl = new Repl(editor);
    const run = (line: string) => {
      const result = repl.execute(line); assert.ok(!result.lines[0]?.startsWith('error:'), result.lines.join('\n'));
    };
    const codec = new SvgCodec();
    run('init'); run(`create ${shape.type} s ${shape.params}`);
    const original = codec.encode(editor.document);
    run('move s 10 20');
    for (const [key, value] of Object.entries(shape.moved)) assert.equal(editor.document.find('s').attributes().get(key), value);
    const moved = codec.encode(editor.document);
    run('undo'); assert.equal(codec.encode(editor.document), original);
    run('redo'); assert.equal(codec.encode(editor.document), moved);
    run('undo'); run('scale s 2');
    for (const [key, value] of Object.entries(shape.scaled)) assert.equal(editor.document.find('s').attributes().get(key), value);
    run('undo'); assert.equal(codec.encode(editor.document), original);
    for (const name of [...shape.allowed, 'fill', 'stroke', 'stroke-width']) run(`set s ${name} ${name === 'fill' || name === 'stroke' ? 'red' : '0.5'}`);
    if (shape.type === 'text') { run('set s text ""'); assert.equal(editor.document.find('s').content, ''); }
    assert.equal(repl.execute('set s opacity 0.5').lines[0], 'error: unknown attribute: opacity');
    assert.equal(repl.execute('set s stroke-width -1').lines[0], 'error: stroke-width must be non-negative');
  });
}

test('default styles are omitted, optional fills/strokes and in suffix work for every built-in', () => {
  const editor = new Editor(new MemoryStore()); const repl = new Repl(editor);
  repl.execute('init'); repl.execute('create g scene');
  for (const shape of cases) {
    assert.ok(!repl.execute(`create ${shape.type} ${shape.type} ${shape.params} in scene`).lines[0]?.startsWith('error:'));
    const created = editor.document.find(shape.type);
    assert.equal(created.parent?.id, 'scene');
    assert.equal(created.attributes().has('fill'), false); assert.equal(created.attributes().has('stroke'), false);
  }
  repl.execute('create rect filled 0 0 1 2 #eee in scene');
  repl.execute('create line stroked 0 0 1 2 black in scene');
  repl.execute('create g nested in scene');
  assert.equal(editor.document.find('filled').attributes().get('fill'), '#eee');
  assert.equal(editor.document.find('stroked').attributes().get('stroke'), 'black');
  assert.equal(editor.document.find('nested').parent?.id, 'scene');
});

test('nested group scale multiplies every geometric field exactly once and preserves styles', () => {
  const editor = new Editor(new MemoryStore()); const repl = new Repl(editor); const codec = new SvgCodec();
  repl.execute('init'); repl.execute('create g outer'); repl.execute('create g inner in outer');
  for (const shape of cases) repl.execute(`create ${shape.type} ${shape.type} ${shape.params} in inner`);
  repl.execute('set outer fill blue'); repl.execute('set inner stroke-width 3');
  const before = codec.encode(editor.document);
  repl.execute('scale outer 2');
  for (const shape of cases) for (const [key, value] of Object.entries(shape.scaled)) {
    assert.equal(editor.document.find(shape.type).attributes().get(key), value);
  }
  assert.equal(editor.document.find('outer').attributes().get('fill'), 'blue');
  assert.equal(editor.document.find('inner').attributes().get('stroke-width'), '3');
  repl.execute('undo'); assert.equal(codec.encode(editor.document), before);
});

test('front/back/addto/delete change only the selected subtree and one undo restores exact XML', () => {
  const editor = new Editor(new MemoryStore()); const repl = new Repl(editor); const codec = new SvgCodec();
  repl.execute('init');
  for (const id of ['a', 'b', 'c']) repl.execute(`create rect ${id} 1 2 3 4`);
  repl.execute('create g group');
  for (const [command, expected] of [
    ['front a', ['b', 'c', 'group', 'a']], ['back c', ['c', 'a', 'b', 'group']],
  ] as const) {
    const before = codec.encode(editor.document); repl.execute(command);
    assert.deepEqual(editor.document.root.children.map(s => s.id), expected);
    repl.execute('undo'); assert.equal(codec.encode(editor.document), before);
    repl.execute('redo'); repl.execute('undo');
  }
  const before = codec.encode(editor.document); repl.execute('addto group a');
  assert.equal(editor.document.find('a').parent?.id, 'group');
  repl.execute('addto group b');
  assert.deepEqual(editor.document.container('group').children.map(s => s.id), ['a', 'b']);
  repl.execute('addto group a');
  assert.deepEqual(editor.document.container('group').children.map(s => s.id), ['b', 'a']);
  repl.execute('undo'); repl.execute('undo'); repl.execute('undo');
  assert.equal(codec.encode(editor.document), before);
  repl.execute('delete b'); assert.deepEqual(editor.document.root.children.map(s => s.id), ['a', 'c', 'group']);
  repl.execute('undo'); assert.equal(codec.encode(editor.document), before);
});

test('exact required error messages preserve XML and the redo branch', () => {
  const editor = new Editor(new MemoryStore()); const repl = new Repl(editor); const codec = new SvgCodec();
  repl.execute('init'); repl.execute('create g scene'); repl.execute('create g nested in scene');
  repl.execute('create rect r 1 2 3 4 in nested'); repl.execute('move r 3 4'); repl.execute('undo');
  const before = codec.encode(editor.document);
  for (const [command, expected] of [
    ['create g r', 'id already exists: r'], ['delete missing', 'no such shape: missing'],
    ['create g x in absent', 'no such container: absent'], ['create g x in r', 'not a container: r'],
    ['create hexagon h', 'unknown shape type: hexagon (is the plugin loaded?)'],
    ['group bad r scene', 'cannot group a container into its own descendant: scene'],
    ['ungroup scene', 'cannot ungroup top-level container: scene'],
    ['scale r 0', 'scale factor must be positive'], ['scale r -2', 'scale factor must be positive'],
    ['set r unknown value', 'unknown attribute: unknown'],
    ['addto nested scene', 'cannot move a container into its own descendant: scene'],
    ['addto scene scene', 'cannot move a container into its own descendant: scene'],
    ['group duplicate r r', 'duplicate group member'],
  ]) {
    assert.equal(repl.execute(command!).lines[0], `error: ${expected}`);
    assert.equal(codec.encode(editor.document), before, command);
  }
  repl.execute('redo'); assert.equal(editor.document.find('r').attributes().get('x'), '4');
});

test('overflow during a recursive edit is atomic, even after an earlier child has changed', () => {
  const editor = new Editor(new MemoryStore()); const repl = new Repl(editor); const codec = new SvgCodec();
  repl.execute('init'); repl.execute('create g g');
  repl.execute('create rect first 1 2 3 4 in g'); repl.execute('create rect huge 1e308 2 3 4 in g');
  const before = codec.encode(editor.document);
  assert.match(repl.execute('scale g 2').lines[0]!, /^error:/);
  assert.equal(codec.encode(editor.document), before);
  repl.execute('undo'); assert.throws(() => editor.document.find('huge'), /no such shape/);
});

test('group across different parents uses nearest common ancestor and document order', () => {
  const editor = new Editor(new MemoryStore()); const repl = new Repl(editor);
  for (const command of ['init', 'create g outer', 'create g left in outer', 'create g right in outer',
    'create rect a 1 2 3 4 in left', 'create rect b 5 6 7 8 in right', 'group joined b a']) repl.execute(command);
  assert.equal(editor.document.find('joined').parent?.id, 'outer');
  assert.deepEqual(editor.document.container('joined').children.map(s => s.id), ['a', 'b']);
  repl.execute('ungroup joined');
  assert.deepEqual(editor.document.container('outer').children.map(s => s.id), ['a', 'b', 'left', 'right']);
});

test('tree [id], show parent and help expose the complete editing interface', () => {
  const editor = new Editor(new MemoryStore()); const repl = new Repl(editor);
  repl.execute('init'); repl.execute('create g g'); repl.execute('create circle c 1 2 3 red in g');
  const tree = repl.execute('tree g').lines.join('\n');
  assert.match(tree, /^g#g\n└── circle#c cx=1 cy=2 r=3 fill=red$/);
  const show = repl.execute('show c').lines.join('\n'); assert.match(show, /parent=g#g/); assert.match(show, /cx=1/);
  const help = repl.execute('help').lines.join('\n');
  for (const name of ['init', 'read', 'save', 'canvas', 'create', 'delete', 'move', 'scale', 'set', 'group', 'ungroup', 'addto', 'front', 'back', 'tree', 'show', 'help', 'undo', 'redo']) {
    assert.ok(new RegExp(`^${name}(?: |$)`, 'm').test(help), name);
  }
});

test('successful save remembers path; failed read does not replace document or its path', () => {
  const editor = new Editor(new MemoryStore()); const repl = new Repl(editor);
  repl.execute('init'); assert.equal(repl.execute('save').lines[0], 'error: no file path. use save <file.svg>');
  repl.execute('save first.svg'); assert.equal(repl.execute('save').lines[0], 'saved to first.svg (0 elements)');
  repl.execute('init'); assert.equal(repl.execute('save').lines[0], 'error: no file path. use save <file.svg>');
  const actual = new Repl(new Editor(new FileSvgStore()));
  assert.equal(actual.execute('read __nonexistent_pj1.svg').lines[0], 'error: cannot read file: __nonexistent_pj1.svg');
});
