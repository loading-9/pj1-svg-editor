import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const root = resolve('src');
const files = [];
const collect = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (entry.name.endsWith('.ts')) files.push(path);
  }
};
collect(root);
const errors = [];
const allowed = {
  domain: new Set(['domain']),
  application: new Set(['application', 'domain']),
  infrastructure: new Set(['infrastructure', 'domain', 'application']),
  cli: new Set(['cli', 'application', 'domain', 'infrastructure']),
};
const externalAllowed = { domain: new Set(), application: new Set(), infrastructure: new Set(['@xmldom/xmldom', 'transformation-matrix']) };
for (const file of files) {
  const local = relative(root, file).replaceAll('\\', '/');
  const layer = local.split('/')[0];
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const classes = source.statements.filter(ts.isClassDeclaration);
  if (classes.length > 1) errors.push(`${local}: more than one class`);
  if (classes.length && classes[0].name?.text !== basename(file, '.ts')) errors.push(`${local}: class/file name mismatch`);
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement)) errors.push(`${local}: top-level free function`);
    if (!ts.isImportDeclaration(statement)) continue;
    const imported = statement.moduleSpecifier.text;
    if (imported.startsWith('.')) {
      const target = relative(root, resolve(dirname(file), imported)).replaceAll('\\', '/');
      const targetLayer = target.split('/')[0];
      if (!allowed[layer]?.has(targetLayer)) errors.push(`${local}: forbidden dependency ${imported}`);
      // Only these two application contracts are consumed by infrastructure.
      if (layer === 'infrastructure' && targetLayer === 'application' && !['SvgStore.js', 'ShapeFactory.js'].includes(basename(imported))) {
        errors.push(`${local}: infrastructure must not depend on application orchestration`);
      }
    } else if (layer !== 'cli' && !(layer === 'infrastructure' && imported.startsWith('node:')) && !externalAllowed[layer]?.has(imported)) {
      errors.push(`${local}: forbidden external dependency ${imported}`);
    }
  }
  const inspect = node => {
    if (ts.isSwitchStatement(node)) errors.push(`${local}: switch dispatch is not allowed`);
    if (ts.isBinaryExpression(node) && /^(===|==|!==|!=)$/.test(node.operatorToken.getText(source))) {
      const left = node.left.getText(source); const right = node.right.getText(source);
      const namedShapeDispatch = /\.type$/.test(left) && /^['"]/.test(right);
      if (namedShapeDispatch) errors.push(`${local}: shape type dispatch outside factory`);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
}
if (errors.length) {
  process.stderr.write(errors.join('\n') + '\n'); process.exitCode = 1;
} else console.log(`Architecture checks passed: ${files.length} source files; layer imports, class/file names, no free functions or switch dispatch.`);
