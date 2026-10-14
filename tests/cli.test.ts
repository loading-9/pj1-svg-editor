import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Tokenizer } from '../src/cli/Tokenizer.js';
import { Repl } from '../src/cli/Repl.js';
import { Editor } from '../src/application/Editor.js';
import { FileSvgStore } from '../src/infrastructure/FileSvgStore.js';
import { SvgCodec } from '../src/infrastructure/SvgCodec.js';

test('tokenizer handles comments, hex colors, empty quotes, Unicode and Windows paths', () => {
  const tokenizer = new Tokenizer();
  assert.deepEqual(tokenizer.tokenize('  # comment'), []);
  assert.deepEqual(tokenizer.tokenize('create text t 1 2 "你好 world"'), ['create', 'text', 't', '1', '2', '你好 world']);
  assert.deepEqual(tokenizer.tokenize('set r fill #ffffff'), ['set', 'r', 'fill', '#ffffff']);
  assert.deepEqual(tokenizer.tokenize('set t text ""'), ['set', 't', 'text', '']);
  assert.deepEqual(tokenizer.tokenize('read "C:\\my files\\a.svg"'), ['read', 'C:\\my files\\a.svg']);
  assert.deepEqual(tokenizer.tokenize('set t text "say \\"hi\\""'), ['set', 't', 'text', 'say "hi"']);
  assert.throws(() => tokenizer.tokenize('set t text "broken'), /unterminated/);
});

test('REPL emits single-line errors, continues after failure, and exit is dispatched centrally', () => {
  const repl = new Repl(new Editor(new FileSvgStore()));
  assert.equal(repl.execute('tree').lines[0], "error: no document. use 'init' or 'read' first");
  assert.match(repl.execute('unknown').lines[0]!, /^error: unknown command/);
  assert.deepEqual(repl.execute('  # hi').lines, []);
  repl.execute('init'); repl.execute('create g g');
  assert.equal(repl.execute('ungroup g').lines[0], 'error: cannot ungroup top-level container: g');
  assert.equal(repl.execute('create box box').lines[0], 'error: unknown shape type: box (is the plugin loaded?)');
  assert.equal(repl.execute('exit extra').exit, false); assert.equal(repl.execute('exit').exit, true);
  assert.equal(repl.execute('quit').exit, true);
});

test('attachment session replays through actual CLI process', () => {
  const directory = mkdtempSync(join(tmpdir(), 'pj1-session-'));
  try {
    const target = join(directory, 'demo.svg');
    const session = readFileSync('examples/session.txt', 'utf8').replace('save examples/generated/demo.svg', `save "${target}"`);
    const result = spawnSync(process.execPath, ['dist/src/cli/main.js'], { input: session, encoding: 'utf8' });
    assert.equal(result.status, 0); assert.equal(result.stderr, '');
    assert.match(result.stdout, /circle#c1 moved by \(30,0\).*cx=130/);
    assert.match(result.stdout, /error: cannot group a container into its own descendant: markers/);
    assert.match(result.stdout, /error: undo not allowed after io command/);
    assert.match(result.stdout, /warning: assigned id rect1 to unnamed <rect>/);
    assert.match(result.stdout, /svg \(400x300\)/);
    assert.equal(result.stdout.split('\n').filter(line => line.startsWith('error:')).length, 2);
    const saved = new SvgCodec().decode(readFileSync(target, 'utf8')).document;
    assert.equal(saved.count, 5); assert.equal(saved.find('c1').attributes().get('cx'), '130');
    assert.equal(saved.find('title').content, 'My Diagram'); assert.equal(saved.find('box').parent?.id, 'markers');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('flowchart replay moves rect and text together and saves the restored coordinates', () => {
  const directory = mkdtempSync(join(tmpdir(), 'pj1-flow-'));
  try {
    const target = join(directory, 'flowchart.svg');
    const session = readFileSync('examples/flowchart.txt', 'utf8').replace('save examples/generated/flowchart.svg', `save "${target}"`);
    const editor = new Editor(new FileSvgStore()); const repl = new Repl(editor);
    for (const line of session.split(/\r?\n/)) {
      const result = repl.execute(line);
      assert.ok(result.lines.every(message => !message.startsWith('error:')), result.lines.join('\n'));
      if (line === 'move node2 0 100') {
        assert.equal(editor.document.find('process').attributes().get('y'), '200');
        assert.equal(editor.document.find('process-label').attributes().get('y'), '235');
      }
    }
    const saved = new FileSvgStore().read(target).document;
    assert.equal(saved.count, 8); assert.equal(saved.find('process').attributes().get('y'), '100');
    assert.equal(saved.find('process-label').content, '处理数据 v2');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('EOF exits and explicit quit discards following script commands', () => {
  const eof = spawnSync(process.execPath, ['dist/src/cli/main.js'], { input: 'init\ncanvas\n', encoding: 'utf8' });
  assert.equal(eof.status, 0); assert.match(eof.stdout, /canvas 800x600/);
  const quit = spawnSync(process.execPath, ['dist/src/cli/main.js'], { input: 'init\nquit\ncreate g forbidden\n', encoding: 'utf8' });
  assert.equal(quit.status, 0); assert.doesNotMatch(quit.stdout, /forbidden/);
});
