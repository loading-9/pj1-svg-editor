import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trimEnd();
const args=process.argv.slice(2),value=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const target=value('--to','p2'),label=value('--label',target),out=value('--out','docs/metrics');
const categorize=file=>file.startsWith('vscode-extension/')?'vscode':file.startsWith('plugins/')?'plugins':file.startsWith('src/host/')||file.startsWith('src/cli/')||file.startsWith('src/infrastructure/')?'assembly':file.startsWith('src/')?'kernel':undefined;
const roles={Shape:'图形公共抽象、样式封装及克隆协议',GeometryShape:'几何字段、验证与多态变换',Group:'Composite 子树及父子关系',SvgDocument:'画布、查找、分组、顺序及全局不变量',Numbers:'有限数及尺寸验证',AffineTransform:'仿射矩阵值对象',Command:'命令抽象及运行协议',EditCommand:'编辑副本与 before/after Memento',Editor:'会话、路径、保存快照及历史协调',EditorContext:'命令消费的公开用例端口',Extensions:'扩展注册表与属性策略选择',History:'撤销重做栈与 IO 屏障',Arguments:'命令参数及数量验证',CommandRegistry:'按注册名分发命令',ShapeFactory:'调用图形提供器创建与读回',HelpText:'汇总已注册命令和图形语法',SvgStore:'持久化端口',ShapeProvider:'图形扩展契约',AttributeHandler:'属性语义扩展契约',TreeDecorator:'标签与保存比较视图契约',TreeRenderer:'不识别插件名的结构渲染',Plugin:'插件、注册上下文与清单类型',SvgCodec:'SVG/XML 编解码与提供器适配',FileSvgStore:'UTF-8 文件存储与临时替换',Defaults:'默认内置能力装配',Registration:'注册暂存、接口检查与原子发布',PluginLoader:'通用模块加载、配置和清单校验',Tokenizer:'终端参数与注释分词',Repl:'逐行终端交互与错误边界',BuiltinShapeProvider:'旧图形类的提供器适配',BuiltinShapes:'内置六种图形的插件装配',BuiltinCommands:'内置命令的插件装配',DirectoryReader:'目录访问端口与项类型',NodeDirectoryReader:'Node 文件系统到目录端口的适配',Box:'复合框体与必要部件不变量',BoxProvider:'box 创建及带标记 g 的读回',BoxAttributes:'fill/label 的领域传播',BoxTypeLabel:'box 类型行尾标签',BoxPlugin:'注册 box 的三个扩展实现',ModifiedStar:'实例内 dirty 缓存与保存内容比较',ModifiedStarPlugin:'注册 dirty 标签',StatsPlugin:'注册 stats 命令',DirPlugin:'注入目录端口并注册 dir',SvgExtension:'VSCode 两种提供器的注册',OutlineParser:'含源码位置的 XML 解析',OutlineNode:'大纲位置树节点',SvgFileDecorationProvider:'只读 SVG 文件装饰适配',SvgDocumentSymbolProvider:'位置树到原生大纲符号适配',api:'插件公共 API 门面',codePlugins:'可选插件代码装配表',extension:'VSCode 生命周期入口',main:'CLI 组合入口',index:'导出插件默认实例'};
const responsibility=file=>{const name=file.split('/').at(-1).replace(/\.ts$/,'');return roles[name]??(name.endsWith('Command')?'命令对象：'+name.replace(/Command$/,''):'图形领域实现：'+name);};
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
