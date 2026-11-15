import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
const files=[];
const collect=d=>{for(const e of readdirSync(d,{withFileTypes:true})){const p=join(d,e.name);if(e.isDirectory())collect(p);else if(p.endsWith('.ts'))files.push(p);}};
collect('src');collect('plugins');collect('vscode-extension/src');
const errors=[];
for(const file of files){
 const local=file.replaceAll('\\','/'),source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 const classes=source.statements.filter(ts.isClassDeclaration);
 if(classes.length>1||classes.some(c=>c.name?.text!==basename(file,'.ts')))errors.push(local+': class/file mismatch');
 for(const statement of source.statements){
  if(ts.isFunctionDeclaration(statement))errors.push(local+': free function');
  if(!ts.isImportDeclaration(statement)&&!ts.isExportDeclaration(statement))continue;
  const target=statement.moduleSpecifier?.text;if(!target)continue;
  const resolved=relative(resolve('.'),resolve(dirname(file),target)).replaceAll('\\','/');
  if(local.startsWith('plugins/')&&target.startsWith('.')&&!resolved.startsWith(dirname(local).replaceAll('\\','/')+'/')&&resolved!=='src/api.js')errors.push(local+': plugin must use public API: '+target);
  if(local.startsWith('src/domain/')&&(!target.startsWith('.')||!resolved.startsWith('src/domain/')))errors.push(local+': domain dependency '+target);
  if(local.startsWith('src/application/')&&(!target.startsWith('.')||(!resolved.startsWith('src/domain/')&&!resolved.startsWith('src/application/'))))errors.push(local+': application dependency '+target);
  if(local.startsWith('src/')&&!local.startsWith('src/host/')&&resolved.startsWith('plugins/'))errors.push(local+': kernel/adapter imports plugin');
  if(local.startsWith('vscode-extension/')&&target.startsWith('.')&&!resolved.startsWith('vscode-extension/'))errors.push(local+': extension coupled to CLI');
 }
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Architecture checks passed: ${files.length} production TS files; public plugin API, kernel independence, class/file names, extension isolation.`);
