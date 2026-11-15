import {readdirSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
for(const file of readdirSync('tests').filter(f=>f.endsWith('.unit.test.ts'))){
 const name=file.replace('.unit.test.ts','');const source=readFileSync('tests/'+file,'utf8');
 for(const match of source.matchAll(/from ['"]([^'"]+)['"]/g)){
  const imported=match[1];
  assert.ok(imported.startsWith('node:')||imported==='../src/api.js'||imported.startsWith('../plugins/'+name+'/'),file+': not independent: '+imported);
 }
}
console.log('All six plugin unit suites import only their own package, the public API and Node test libraries.');
