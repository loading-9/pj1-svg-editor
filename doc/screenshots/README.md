# VSCode 真实运行证据：待补齐

本目录尚无运行截图。提供器单元测试和扩展构建已经通过，但没有将其当成真实界面验收。

请按 [扩展运行说明](../../vscode-extension/README.md) 自行启动并验证。需要保存：

1. `svg-badge.png`：Explorer 中 example.svg 显示 []，notes.txt 和 folder.svg 目录无标记，文件名未改。
2. `svg-outline-location.png`：原生 Outline 展开嵌套、无 ID 的 text；点击 rect#start 后定位第 3 行。
3. `svg-outline-recovery.png`：编辑后更新，以及不完整 XML 清空、恢复合法 XML 后继续工作。可以补一份简短的实际操作记录说明截图前后的动作。

还需先观察未装此插件时 TypeScript 文件的原生 Outline，记录层级、点击定位、编辑更新的行为。此前只定位到 Outline 入口，尚未完成该观察，不能记为已完成。

截图必须来自真实 VSCode；不生成示意截图。材料补齐前不创建最终 p2 标签，避免后续为补图而移动标签。
