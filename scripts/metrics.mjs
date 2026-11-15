import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trimEnd();
const args=process.argv.slice(2),value=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const target=value('--to','p2'),label=value('--label',target),out=value('--out','docs/metrics');
const categorize=file=>file.startsWith('vscode-extension/')?'vscode':file.startsWith('plugins/')?'plugins':file.startsWith('src/host/')||file.startsWith('src/cli/')||file.startsWith('src/infrastructure/')?'assembly':file.startsWith('src/')?'kernel':undefined;
const responsibility=file=>file.startsWith('src/domain/')?'领域与树不变量':file.startsWith('src/application/')?'用例、历史及扩展契约':file.startsWith('src/infrastructure/')?'SVG/XML 与文件适配':file.startsWith('src/host/')?'装配、配置及事务式插件加载':file.startsWith('src/cli/')?'终端输入与组合入口':file.startsWith('plugins/')?'图形、命令或标签插件':'VSCode 提供器与位置树';
const measure=ref=>git('ls-tree','-r','--name-only',ref).split('\n').filter(f=>f.endsWith('.ts')&&categorize(f)).map(file=>{
 const text=execFileSync('git',['show',ref+':'+file],{encoding:'utf8'}),source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
 let functions=0,decisions=0;
 const visit=node=>{
  if(ts.isFunctionLike(node)&&node.body)functions++;
  if(ts.isIfStatement(node)||ts.isForStatement(node)||ts.isForOfStatement(node)||ts.isForInStatement(node)||ts.isWhileStatement(node)||ts.isDoStatement(node)||ts.isCatchClause(node)||ts.isConditionalExpression(node)||ts.isCaseClause(node))decisions++;
  if(ts.isBinaryExpression(node)&&[ts.SyntaxKind.AmpersandAmpersandToken,ts.SyntaxKind.BarBarToken,ts.SyntaxKind.QuestionQuestionToken].includes(node.operatorToken.kind))decisions++;
  ts.forEachChild(node,visit);
 };visit(source);
 return {file,category:categorize(file),responsibility:responsibility(file),lines:text.split(/\r?\n/).length-(text.endsWith('\n')?1:0),complexity:functions+decisions,functions,decisions};
});
const before=measure('final'),after=measure(target);
const total=(rows,category,key)=>rows.filter(r=>category==='cli'?r.category!=='vscode':r.category===category).reduce((n,r)=>n+r[key],0);
const summary=['kernel','assembly','plugins','cli','vscode'].map(category=>({category,linesBefore:total(before,category,'lines'),linesAfter:total(after,category,'lines'),complexityBefore:total(before,category,'complexity'),complexityAfter:total(after,category,'complexity')}));
mkdirSync(out,{recursive:true});
writeFileSync(out+'/metrics.json',JSON.stringify({baseline:'final',target:label,method:'Physical TS lines including comments/blanks. Complexity=sum(function baselines + if/loops/catch/ternary/case/&&/||/?? decisions). CLI adapters and host count as assembly. Dependencies, output, tests and scripts excluded. VSCode separate.',summary,before,after},null,2)+'\n');
writeFileSync(out+'/README.md','# Git 历史指标\n\n基线 `final` → `'+label+'`。由 `scripts/metrics.mjs` 从 Git 对象读取，未手填数字。\n\nCLI 三类：内核（domain/application/api）、装配处（host/cli/infrastructure，含持久化适配器）、插件（plugins）。VSCode 单列。物理行数包含注释和空行；复杂度为所有有函数体的函数基数加 if、循环、catch、三元、case、&&、||、?? 决策点总数，反映聚合变化。测试、脚本、依赖和构建产物不计入。\n\n|类别|行数 final|行数 '+label+'|复杂度 final|复杂度 '+label+'|增量|\n|---|---:|---:|---:|---:|---:|\n'+summary.map(r=>`|${r.category}|${r.linesBefore}|${r.linesAfter}|${r.complexityBefore}|${r.complexityAfter}|${r.complexityAfter-r.complexityBefore}|`).join('\n')+'\n\n文件清单、逐文件职责和数值见 [metrics.json](metrics.json)。\n');
console.log('Generated Git-based metrics: '+out);
