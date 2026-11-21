# PJ1 — SVG 编辑器与插件实践

TypeScript 面向对象 SVG CLI；Phase 2 提供图形、命令、树标签、属性语义扩展，以及独立的 VSCode SVG 标记和原生大纲扩展。

```sh
npm ci
npm run build
node dist/src/cli/main.js
node dist/src/cli/main.js --code
node dist/src/cli/main.js --config plugins.config.json
```

无参数入口提供原有六种图形与命令。`--code` 和 `--config` 装入相同的 stats、dir、box、modified-star 插件。提示符 `svg>`，`help` 查看语法；双引号处理空格参数，`#` 开头整行是注释。

```text
init 800 600
create box start 120 100 160 60 "开始"
set start label "处理数据"
stats
dir
tree
```

运行上例需要启用插件。禁用新增插件后，CLI 的输出与 Phase 1 final 保持一致。

```sh
npm run check
npm run test:plugins
npm run test:plugin -- box
npm run build:extension
npm run verify:compatibility
npm run verify:git
```

用 VSCode 打开仓库，选 **SVG Mark and Outline** 调试配置并按 F5。步骤、示例及模式分析见 [扩展说明](vscode-extension/README.md)。

[项目文档](doc/README.md) · [逐项验收](doc/phase2-audit.md) · [验证记录](doc/verification/phase2.json) · [Git 指标](docs/metrics/README.md)

VSCode 实机记录见 [截图与操作结果](doc/screenshots/README.md)。Phase 2 最终版本使用本地标签 `p2`。
