# Git 历史指标

基线 `final` → `p2`。由 `scripts/metrics.mjs` 从 Git 对象读取，未手填数字。

CLI 三类：内核（domain/application/api）、装配处（host/cli/infrastructure，含持久化适配器）、插件（plugins）。VSCode 单列。物理行数包含注释和空行；复杂度为所有有函数体的函数基数加 if、循环、catch、三元、case、&&、||、?? 决策点总数，反映聚合变化。测试、脚本、依赖和构建产物不计入。

|类别|行数 final|行数 p2|复杂度 final|复杂度 p2|增量|
|---|---:|---:|---:|---:|---:|
|kernel|976|793|323|262|-61|
|assembly|210|375|92|194|102|
|plugins|0|526|0|188|188|
|cli|1186|1694|415|644|229|
|vscode|0|68|0|24|24|

文件清单、逐文件职责和数值见 [metrics.json](metrics.json)。
