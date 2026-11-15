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
 const results=[];
 const config=resolve('plugins.config.json');
 for(const [name,inputFile] of [['cli-1','cli-1.txt'],['box','box.txt'],['plugins','plugins.txt']]){
  const session=readFileSync(join(report,inputFile),'utf8');
  const working=join(temp,'dual-'+name);mkdirSync(working);
  if(name==='cli-1'){cpSync('examples',join(working,'examples'),{recursive:true});mkdirSync(join(working,'examples/generated'),{recursive:true});}
  else if(name==='plugins'){
   mkdirSync(join(working,'docs'));mkdirSync(join(working,'plugins'));
   writeFileSync(join(working,'.hidden'),'fixed');writeFileSync(join(working,'demo.svg'),'<svg/>');writeFileSync(join(working,'package.json'),'{}');
  }
  const start=flags=>{const r=spawnSync(process.execPath,[join(root,'dist/src/cli/main.js'),...flags],{cwd:working,input:session,encoding:null});assert.equal(r.status,0);assert.equal(r.stderr.length,0);return r.stdout;};
  const a=start(['--code']),b=start(['--config',config]);assert.deepEqual(a,b,name+' code/config stdout mismatch');
  writeFileSync(join(report,name+'.code.out.txt'),a);writeFileSync(join(report,name+'.config.out.txt'),b);
  const output=a.toString('utf8');
  if(name==='plugins'){assert.ok(output.includes('rect: 1  text: 1  (total 2, containers 2)'));assert.equal(output.split('\n').filter(l=>l.startsWith('error:')).length,0);}
  if(name==='box'){assert.ok(output.includes('(box)'));assert.ok(output.includes('containers 3'));assert.ok(output.includes('error: cannot ungroup composite shape: n1'));}
  results.push({name,bytes:a.length,byteIdentical:true});
 }
 const result={baseline:'final',phase1Bytes:before.length,phase1ByteIdentical:true,baselineCompiledFromGit:true,dualAssembly:results,fixedDirectoryLogsOutsideCwd:true};
 writeFileSync(join(report,'compatibility.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
} finally {rmSync(temp,{recursive:true,force:true});}
