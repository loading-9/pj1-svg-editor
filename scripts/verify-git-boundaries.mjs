import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const cases=[
 {name:'box-code-A',commit:'2a02cc0',added:'plugins/box/',changed:['src/host/codePlugins.ts'],tests:['tests/box.test.ts']},
 {name:'box-config-B',commit:'3a22dba',added:'plugins/box/',changed:['plugins.config.json'],tests:[]},
 {name:'modified-star',commit:'2fc0d9f',added:'plugins/tree-star/',changed:['src/host/codePlugins.ts','plugins.config.json'],tests:['tests/decorators.test.ts','tests/attributes.test.ts']},
];
const report=[];
for(const item of cases){
 const parent=item.commit+'^';
 const exists=git('ls-tree','-r','--name-only',parent,'src/application','src/domain','plugins/builtin-shapes','plugins/builtin-commands');assert.ok(exists.includes('src/domain/Shape.ts')&&exists.includes('plugins/builtin-shapes/Rect.ts'));
 const files=git('diff','--name-only',parent,item.commit).split('\n').filter(Boolean);
 for(const file of files)assert.ok(file.startsWith(item.added)||item.changed.includes(file)||item.tests.includes(file),item.name+': unexpected edit '+file);
 const oldPlugins=git('ls-tree','-d','--name-only',parent,'plugins/').split('\n').filter(p=>p&&p+'/'!==item.added);
 const protectedPaths=['src/application','src/domain','src/infrastructure','src/host/PluginLoader.ts',...oldPlugins];
 const diff=git('diff',parent,item.commit,'--',...protectedPaths,':(exclude)'+item.added+'**');assert.equal(diff,'');
 report.push({name:item.name,commit:git('rev-parse',item.commit),checkedPathsExist:true,protectedPaths,protectedDiffEmpty:true,files});
}
mkdirSync('doc/verification',{recursive:true});writeFileSync('doc/verification/git-boundaries.json',JSON.stringify(report,null,2)+'\n');console.log('Verified independent A/B box commits and label commit: protected paths exist, kernel/loader/old-plugin diffs empty.');
