import test from 'node:test';
import assert from 'node:assert/strict';
import type * as VSCode from 'vscode';
import { OutlineParser } from '../vscode-extension/src/OutlineParser.js';
import { SvgDocumentSymbolProvider } from '../vscode-extension/src/SvgDocumentSymbolProvider.js';
import { SvgFileDecorationProvider } from '../vscode-extension/src/SvgFileDecorationProvider.js';
import { SvgExtension } from '../vscode-extension/src/SvgExtension.js';

test('outline nesting, root, missing IDs, entities and UTF-16 source offsets', () => {
  const source='<?xml version="1.0"?><svg>\r\n<!-- <fake/> --><g id="a&amp;b"><text>中文😀</text><rect id="r"/></g></svg>';
  const roots=new OutlineParser().parse(source);
  assert.equal(roots[0]!.name,'svg'); const group=roots[0]!.children[0]!;
  assert.equal(group.name,'g#a&b'); assert.deepEqual(group.children.map(c=>c.name),['text','rect#r']);
  assert.equal(source.slice(group.start,group.end),'<g id="a&amp;b"><text>中文😀</text><rect id="r"/></g>');
  assert.equal(source.slice(group.children[1]!.start,group.children[1]!.end),'<rect id="r"/>');
});
test('editing reparses, incomplete XML clears safely and valid input recovers', () => {
  const parser=new OutlineParser();
  assert.equal(parser.parse('<svg><g id="old"/></svg>')[0]!.children[0]!.name,'g#old');
  for(const source of ['<svg><g','<svg><g></svg>','<svg/><svg/>','<svg a="','<svg>&bad;</svg>']) assert.deepEqual(parser.parse(source),[]);
  assert.equal(parser.parse('<svg><g id="new"/></svg>')[0]!.children[0]!.name,'g#new');
});
test('symbol adapter gives selection ranges, cancellation and updates', () => {
  class Range { constructor(readonly start: unknown, readonly end: unknown) {} }
  class Symbol { children: Symbol[]=[]; constructor(readonly name:string,readonly detail:string,readonly kind:number,readonly range:Range,readonly selectionRange:Range) {} }
  const api={Range,DocumentSymbol:Symbol,SymbolKind:{Object:19}} as unknown as typeof VSCode;
  const provider=new SvgDocumentSymbolProvider(api); let source='<svg>\n<rect id="r"/>\n</svg>';
  const doc={getText:()=>source,positionAt:(offset:number)=>offset} as unknown as VSCode.TextDocument;
  const symbols=provider.provideDocumentSymbols(doc,{isCancellationRequested:false} as VSCode.CancellationToken);
  assert.equal(symbols[0]!.children[0]!.name,'rect#r');
  assert.equal((symbols[0]!.children[0]!.selectionRange as unknown as Range).start,source.indexOf('rect'));
  source='<svg><text/></svg>'; assert.equal(provider.provideDocumentSymbols(doc,{} as VSCode.CancellationToken)[0]!.children[0]!.name,'text');
  assert.deepEqual(provider.provideDocumentSymbols(doc,{isCancellationRequested:true} as VSCode.CancellationToken),[]);
});
test('decoration only marks existing SVG files without writes or renames', async () => {
  let type=1; const calls:string[]=[];
  class Decoration { constructor(readonly badge:string,readonly tooltip:string) {} }
  const api={FileType:{File:1,Directory:2},FileDecoration:Decoration,workspace:{fs:{stat:async(uri:{path:string})=>{ calls.push(uri.path); if(uri.path==='/missing.svg') throw Error('missing'); return {type}; }}}} as unknown as typeof VSCode;
  const provider=new SvgFileDecorationProvider(api); const uri=(path:string)=>({path} as VSCode.Uri);
  assert.equal((await provider.provideFileDecoration(uri('/a.svg')))!.badge,'[]');
  assert.equal((await provider.provideFileDecoration(uri('/UPPER.SVG')))!.badge,'[]');
  assert.equal(await provider.provideFileDecoration(uri('/a.txt')),undefined);
  type=2; assert.equal(await provider.provideFileDecoration(uri('/folder.svg')),undefined);
  assert.equal(await provider.provideFileDecoration(uri('/missing.svg')),undefined);
  assert.deepEqual(calls,['/a.svg','/UPPER.SVG','/folder.svg','/missing.svg']);
});
test('activation registers native providers and hands disposables to VSCode', () => {
  const registered:string[]=[],subscriptions:unknown[]=[];
  const api={window:{registerFileDecorationProvider:()=>{registered.push('badge');return 'badge-disposable';}},languages:{registerDocumentSymbolProvider:(selector:unknown)=>{assert.deepEqual(selector,{scheme:'file',pattern:'**/*.[sS][vV][gG]'}); registered.push('outline');return 'outline-disposable';}}} as unknown as typeof VSCode;
  new SvgExtension(api).activate({subscriptions} as unknown as VSCode.ExtensionContext);
  assert.deepEqual(registered,['badge','outline']); assert.deepEqual(subscriptions,['badge-disposable','outline-disposable']);
});
