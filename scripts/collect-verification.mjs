import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import ts from 'typescript';
const directory='doc/verification';mkdirSync(directory,{recursive:true});
const steps=[
 ['build',['node_modules/typescript/bin/tsc','-p','tsconfig.json']],
 ['architecture',['scripts/check-architecture.mjs']],
 ['tests',['scripts/test.mjs']],
 ['plugin-imports',['scripts/check-plugin-tests.mjs']],
 ['plugin-tests',['scripts/test.mjs','--plugins-only']],
 ['extension-build',['scripts/build-extension.mjs']],
 ['compatibility',['scripts/verify-compatibility.mjs']],
 ['git-boundaries',['scripts/verify-git-boundaries.mjs']],
];
const results=[];
for(const [name,args] of steps){
 const result=spawnSync(process.execPath,args,{encoding:'utf8'});
 const output=result.stdout+result.stderr;writeFileSync(directory+'/'+name+'.log',output);
 results.push({name,command:['node',...args].join(' '),exitCode:result.status,tests:Number(output.match(/ℹ tests (\d+)/)?.[1]??0)});
 if(result.status!==0){console.error(output);throw new Error('Verification failed: '+name);}
}
writeFileSync(directory+'/phase2.json',JSON.stringify({date:new Date().toISOString().slice(0,10),node:process.version,typescript:ts.version,results,manualVSCodeEvidence:'doc/screenshots/README.md'},null,2)+'\n');
console.log('Collected verification logs; '+results.find(r=>r.name==='tests').tests+' tests passed.');
