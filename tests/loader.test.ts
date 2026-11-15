import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Extensions } from '../src/application/Extensions.js';
import { PluginLoader } from '../src/host/PluginLoader.js';
import type { Plugin, PluginContext } from '../src/api.js';

class LabelPlugin implements Plugin {
  constructor(private readonly fail = false) {}
  activate(ctx: PluginContext, options?: unknown): void {
    ctx.registerDecorator({ name: 'label', decorate: () => String(options ?? 'ok') });
    if (this.fail) throw new Error('after partial registration');
  }
}
test('code activation commits exact manifest, options and registration order', () => {
  const e = new Extensions(), errors: string[] = [], loader = new PluginLoader(e,m=>errors.push(m));
  assert.equal(loader.activate(new LabelPlugin(),{name:'label-package',contributes:{decorators:['label']}},'custom'),true);
  assert.equal(e.decorators.get('label')!.decorate(undefined,{} as never),'custom');
  assert.deepEqual(errors,[]);
});
test('manifest mismatch rolls back every staged registration', () => {
  const e = new Extensions(), errors: string[] = [], loader = new PluginLoader(e,m=>errors.push(m));
  loader.activate(new LabelPlugin(),{name:'mismatch',contributes:{commands:['missing']}});
  assert.equal(e.decorators.size,0); assert.match(errors[0]!,/^error: plugin manifest mismatch: mismatch \(declared: .*registered:/);
});
test('activation exception and duplicate registration preserve previous plugins', () => {
  const e = new Extensions(), errors: string[] = [], loader = new PluginLoader(e,m=>errors.push(m));
  loader.activate(new LabelPlugin(true),{name:'throws'});
  assert.equal(e.decorators.size,0); assert.match(errors[0]!,/failed to activate: throws \(after partial registration\)/);
  loader.activate(new LabelPlugin(),{name:'good',contributes:{decorators:['label']}});
  loader.activate(new LabelPlugin(),{name:'duplicate',contributes:{decorators:['label']}});
  assert.equal(e.decorators.size,1); assert.equal(errors[1],'error: duplicate registration: decorators/label');
});
test('configuration resolves relative to config, package names, skips disabled, and continues after all load failures', () => {
  const directory=mkdtempSync(join(tmpdir(),'svg-loader-'));
  try {
    const make=(name:string, source:string, contributes:object={})=>{
      const folder=join(directory,name); mkdirSync(folder,{recursive:true});
      writeFileSync(join(folder,'package.json'),JSON.stringify({name,main:'index.cjs',contributes}));
      writeFileSync(join(folder,'index.cjs'),source);
    };
    make('no-default','exports.activate = () => {};');
    make('eval-error',"require('missing-inner-dependency');");
    make('activate-error',"exports.default={activate(ctx){ ctx.registerDecorator({name:'partial',decorate(){return '';}});throw Error('boom'); }};");
    make('mismatch',"exports.default={activate(ctx){ctx.registerDecorator({name:'wrong',decorate(){return '';}});}};",{decorators:['expected']});
    make('valid',"exports.default={activate(ctx,options){ctx.registerDecorator({name:'last',decorate(){return options.label;}});}};",{decorators:['last']});
    make('node_modules/named-plugin',"exports.default={activate(ctx){ctx.registerDecorator({name:'named',decorate(){return '';}});}};",{decorators:['named']});
    const entries=[{module:'./not-there'},{module:'./disabled',enabled:false},...['no-default','eval-error','activate-error','mismatch','valid'].map(module=>({module:'./'+module,options:{label:'configured'}})),{module:'named-plugin'}];
    const config=join(directory,'plugins.config.json'); writeFileSync(config,JSON.stringify({plugins:entries}));
    const errors:string[]=[],e=new Extensions(); new PluginLoader(e,m=>errors.push(m)).config(config);
    assert.equal(errors.length,5); assert.equal(errors[0],'error: plugin not found: ./not-there');
    assert.equal(errors[1],'error: plugin has no default export: ./no-default');
    assert.match(errors[2]!,/^error: plugin failed to activate: eval-error/); assert.doesNotMatch(errors[2]!,/plugin not found:/);
    assert.match(errors[3]!,/^error: plugin failed to activate: activate-error/); assert.match(errors[4]!,/^error: plugin manifest mismatch:/);
    assert.deepEqual([...e.decorators.keys()],['last','named']);
    assert.equal(e.decorators.get('last')!.decorate(undefined,{} as never),'configured');
  } finally { rmSync(directory,{recursive:true,force:true}); }
});
test('invalid config structure or syntax reports once and keeps built-ins', () => {
  const directory=mkdtempSync(join(tmpdir(),'svg-config-'));
  try {
    const file=join(directory,'config.json');
    for(const invalid of ['{','null','[]','{}','{"plugins":[null]}','{"plugins":[{"module":"x","enabled":1}]}']) {
      writeFileSync(file,invalid); const errors:string[]=[], e=new Extensions();
      e.decorators.set('existing',{name:'existing',decorate:()=>''});
      new PluginLoader(e,m=>errors.push(m)).config(file);
      assert.deepEqual(errors,['error: invalid plugin config']); assert.equal(e.decorators.size,1);
    }
  } finally { rmSync(directory,{recursive:true,force:true}); }
});
