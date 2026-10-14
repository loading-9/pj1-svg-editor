import test from 'node:test';
import assert from 'node:assert/strict';
import { Rect } from '../src/domain/Rect.js';
import { Group } from '../src/domain/Group.js';
import { SvgDocument } from '../src/domain/SvgDocument.js';
import { AffineTransform } from '../src/domain/AffineTransform.js';

test('geometry, clone isolation and polymorphic group edits', () => {
  const doc = new SvgDocument();
  const group = new Group('scene'); doc.add(group);
  const rect = new Rect('r'); rect.initialize(['1.5', '2', '3', '4']); doc.add(rect, group);
  const copy = doc.clone();
  group.move(10, 20); group.scale(2);
  assert.equal(rect.attributes().get('x'), '23');
  assert.equal(rect.attributes().get('height'), '8');
  assert.equal(copy.find('r').attributes().get('x'), '1.5');
  assert.equal(copy.find('r').parent?.id, 'scene');
  assert.throws(() => rect.setAttribute('height', '-1'), /non-negative/);
  assert.throws(() => rect.setAttribute('id', 'rename'), /unknown attribute/);
});

test('group members retain document order; ancestor cycles are rejected', () => {
  const doc = new SvgDocument();
  for (const id of ['a', 'b', 'c']) doc.add(new Rect(id));
  const group = doc.group('bundle', ['c', 'a']);
  assert.deepEqual(group.children.map(s => s.id), ['a', 'c']);
  assert.deepEqual(doc.root.children.map(s => s.id), ['bundle', 'b']);
  assert.throws(() => doc.group('bad', ['bundle', 'a']), /own descendant/);
  assert.throws(() => doc.reparent(group, group), /own descendant/);
  assert.throws(() => doc.ungroup('bundle'), /top-level/);
});

test('nested ungroup lifts children into exact original slot', () => {
  const doc = new SvgDocument(); const outer = new Group('outer'); doc.add(outer);
  for (const id of ['before', 'a', 'b', 'after']) doc.add(new Rect(id), outer);
  doc.group('inner', ['a', 'b']);
  doc.ungroup('inner');
  assert.deepEqual(outer.children.map(s => s.id), ['before', 'a', 'b', 'after']);
});

test('reparent compensates inherited affine transforms', () => {
  const doc = new SvgDocument(); const group = new Group('g');
  group.applyTransform(new AffineTransform(2, 0, 0, 2, 100, 30)); doc.add(group);
  const rect = new Rect('r'); rect.initialize(['10', '20', '5', '6']); doc.add(rect, group);
  const before = rect.worldTransform().point(10, 20);
  doc.reparent(rect, doc.root);
  assert.deepEqual(rect.worldTransform().point(10, 20), before);
  rect.move(7, 8);
  assert.deepEqual(rect.worldTransform().point(Number(rect.attributes().get('x')), Number(rect.attributes().get('y'))), [127, 78]);
});
