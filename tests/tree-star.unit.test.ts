import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,SvgDocument} from '../src/api.js';
import {ModifiedStar} from '../plugins/tree-star/ModifiedStar.js';
import {ModifiedStarPlugin} from '../plugins/tree-star/ModifiedStarPlugin.js';
import type {PluginContext,TreeDecorator,TreeView} from '../src/api.js';
test('modified-star independent state machine: edit/save/edit/undo snapshot, new nodes, ancestors and instance isolation',()=>{
 let decorator:TreeDecorator|undefined;new ModifiedStarPlugin().activate({registerDecorator:(d:TreeDecorator)=>{decorator=d;}} as PluginContext);
 const star=decorator!,document=new SvgDocument();document.add(new Group('parent'));document.add(new Group('child'),document.container('parent'));
 const saved=document.clone();const view:TreeView={document,saved};
 assert.equal(star.decorate(document.find('child'),view),'');document.find('child').setAttribute('fill','red');
 assert.equal(star.decorate(undefined,view),'*');assert.equal(star.decorate(document.find('parent'),view),'*');assert.equal(star.decorate(document.find('child'),view),'*');
 const savedAfterEdit=document.clone();assert.equal(star.decorate(undefined,{document,saved:savedAfterEdit}),'');
 document.find('child').setAttribute('fill','blue');assert.equal(star.decorate(document.find('child'),{document,saved:savedAfterEdit}),'*');
 assert.equal(star.decorate(undefined,{document:savedAfterEdit.clone(),saved:savedAfterEdit}),'');
 document.add(new Group('new'));assert.equal(star.decorate(document.find('new'),{document,saved:savedAfterEdit}),'*');
 assert.equal(new ModifiedStar().decorate(undefined,{document:saved.clone(),saved}),'');
});
