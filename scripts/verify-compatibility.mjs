import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync, cpSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
const root=resolve('.'),temp=mkdtempSync(join(tmpdir(),'svg-compat-'));
const report=resolve('doc/transcript');mkdirSync(report,{recursive:true});
try {
 const baseline=join(temp,'baseline');mkdirSync(baseline);
 execFileSync('git',['archive','--format=tar','--output='+join(temp,'final.tar'),'final']);
 execFileSync('tar',['-xf',join(temp,'final.tar'),'-C',baseline]);
 symlinkSync(join(root,'node_modules'),join(baseline,'node_modules'),process.platform==='win32'?'junction':'dir');
 execFileSync(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),'-p',join(baseline,'tsconfig.json')]);
 const cwd=join(temp,'fixture');mkdirSync(cwd);cpSync('examples',join(cwd,'examples'),{recursive:true});mkdirSync(join(cwd,'examples/generated'),{recursive:true});
 const input=readFileSync('examples/session.txt','utf8')+'\nhelp\ncanvas\ncreate box absent\n';
 writeFileSync(join(report,'cli-1.txt'),input);
 const run=entry=>{
  const r=spawnSync(process.execPath,[entry],{cwd,input,encoding:null});
  assert.equal(r.status,0);assert.equal(r.stderr.length,0);return r.stdout;
 };
 const before=run(join(baseline,'dist/src/cli/main.js')),after=run(join(root,'dist/src/cli/main.js'));
 assert.deepEqual(after,before,'Phase 1 stdout changed');
 writeFileSync(join(report,'cli-1.final.out.txt'),before);writeFileSync(join(report,'cli-1.baseline.out.txt'),after);
 const result={baseline:'final',phase1Bytes:before.length,phase1ByteIdentical:true,baselineCompiledFromGit:true};
 writeFileSync(join(report,'compatibility.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
} finally {rmSync(temp,{recursive:true,force:true});}
