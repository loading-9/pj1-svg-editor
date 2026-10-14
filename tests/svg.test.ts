import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SvgCodec } from '../src/infrastructure/SvgCodec.js';
import { FileSvgStore } from '../src/infrastructure/FileSvgStore.js';
import { SvgDocument } from '../src/domain/SvgDocument.js';
import { TreeRenderer } from '../src/application/TreeRenderer.js';
import { Text } from '../src/domain/Text.js';

const codec = new SvgCodec();

test('attachment external SVG imports all seven elements and allocates rect1', () => {
  const { document, warnings } = codec.decode(readFileSync('examples/other.svg', 'utf8'));
  assert.equal(document.count, 7); assert.equal(document.width, 400); assert.equal(document.height, 300);
  assert.deepEqual(warnings, ['warning: assigned id rect1 to unnamed <rect>']);
  assert.equal(document.find('r2').parent?.id, 'g1');
  assert.equal(document.find('t1').content, 'imported');
});

test('missing IDs avoid ALL explicit IDs, including later siblings and root', () => {
  const { document, warnings } = codec.decode('<svg id="g1"><g><rect/><rect id="rect1"/></g><rect id="rect2"/><rect/><circle id="R"/><circle id="r"/></svg>');
  assert.equal(document.find('rect3').parent?.id, 'g2');
  assert.equal(document.find('rect4').type, 'rect');
  assert.equal(document.find('R').id, 'R'); assert.equal(document.find('r').id, 'r');
  assert.deepEqual(warnings, [
    'warning: assigned id g2 to unnamed <g>',
    'warning: assigned id rect3 to unnamed <rect>',
    'warning: assigned id rect4 to unnamed <rect>',
  ]);
});

test('round-trip preserves hierarchy, defaults, styles, Unicode and escaped text', () => {
  const source = '<svg xmlns="http://www.w3.org/2000/svg" width="100px" height="80" viewBox="-1 -2 100 80"><g id="g" fill="red"><text id="t" x="1.5" y="2" font-size="16" text-anchor="middle">开始 &amp; &lt;end&gt; "你好"</text><rect id="r" x="0" y="0" width="20" height="30"/></g></svg>';
  const before = codec.decode(source).document; const saved = codec.encode(before); const after = codec.decode(saved).document;
  const renderer = new TreeRenderer();
  assert.deepEqual(renderer.tree(after), renderer.tree(before));
  assert.equal(after.rootAttributes().get('viewBox'), '-1 -2 100 80');
  assert.equal(after.find('t').content, '开始 & <end> "你好"');
  assert.equal(after.find('r').attributes().has('fill'), false);
  assert.match(saved, /&amp;/); assert.match(saved, /&lt;end&gt;/);
});

test('all six built-ins serialize and imported transform lists round-trip', () => {
  const source = '<svg width="400" height="200"><g id="diagram" transform="translate(60,40)"><rect id="a" x="0" y="0" width="120" height="60"/><line id="e" x1="120" y1="30" x2="200" y2="30"/><g id="nodeB" transform="translate(200,0) scale(0.8)"><circle id="c" cx="5" cy="6" r="2"/><ellipse id="el" cx="1" cy="2" rx="3" ry="4"/><text id="t" x="60" y="38">End</text></g></g></svg>';
  const before = codec.decode(source).document;
  const after = codec.decode(codec.encode(before)).document;
  assert.deepEqual(new TreeRenderer().tree(after), new TreeRenderer().tree(before));
  assert.deepEqual(after.find('c').worldTransform().point(5, 6), [264, 44.8]);
  const point = before.find('c').worldTransform().point(5, 6);
  before.group('all', ['c', 'a']);
  assert.deepEqual(before.find('c').worldTransform().point(5, 6), point);
});

test('malformed/unsupported SVG is rejected instead of silently losing data', () => {
  for (const source of [
    '', '<not-svg/>', '<svg><g></svg>', '<svg><rect id="a" id="b"/></svg>',
    '<svg/><svg/>', '<svg><rect id="r"/><g id="r"/></svg>',
    '<svg><rect id="r" width="-1"/></svg>', '<svg width="NaN"/>',
    '<svg viewBox="0 0 1"/>', '<svg><path id="p" d="M0 0"/></svg>',
    '<svg><text id="t"><tspan>nested text</tspan></text></svg>',
    '<!DOCTYPE svg [<!ENTITY test "hello">]><svg/>',
    '<svg><g transform="scale(0)"/></svg>', '<svg><g transform="nonsense(1)"/></svg>',
    '<svg><rect xmlns="urn:foreign"/></svg>', '<svg>unexpected text</svg>',
  ]) assert.throws(() => codec.decode(source), Error, source);
});

test('unloaded composite marker downgrades to ordinary g', () => {
  const document = codec.decode('<svg><g id="outer"><g id="box" data-kind="box"><rect id="box-rect"/></g></g></svg>').document;
  assert.equal(document.container('box').attributes().get('data-kind'), 'box');
  document.ungroup('box');
  assert.equal(document.find('box-rect').parent?.id, 'outer');
});

test('FileSvgStore writes UTF-8 atomically, overwrites, and cleans failed write temps', () => {
  const directory = mkdtempSync(join(tmpdir(), 'pj1-svg-'));
  try {
    const store = new FileSvgStore(); const document = new SvgDocument(); const text = new Text('t');
    text.initialize(['10', '20', '中文 & <SVG>']); document.add(text);
    const path = join(directory, 'file with spaces.svg');
    store.write(path, document); document.resize(200, 100); store.write(path, document);
    assert.equal(store.read(path).document.width, 200);
    assert.equal(store.read(path).document.find('t').content, '中文 & <SVG>');
    assert.deepEqual(readdirSync(directory), ['file with spaces.svg']);
    const target = join(directory, 'directory.svg'); mkdirSync(target);
    assert.throws(() => store.write(target, document), /cannot write file/);
    assert.deepEqual(readdirSync(directory).sort(), ['directory.svg', 'file with spaces.svg']);
    assert.throws(() => store.read(join(directory, 'missing.svg')), /cannot read file/);
    const broken = join(directory, 'broken.svg'); writeFileSync(broken, '<svg><g></svg>');
    assert.throws(() => store.read(broken), /invalid SVG/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
