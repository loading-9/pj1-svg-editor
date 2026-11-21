# VSCode 实机验证

2026-11-21，Windows，VSCode 1.146.0。扩展从源码构建产物加载到独立的 Extension Development Host。示例使用临时副本，验证后与仓库原件逐字节相同。

- [原生大纲对照](native-markdown-outline.png)：未加载 SVG 扩展的窗口中，VSCode 原生 Outline 按 Markdown 标题展示层级。
- [Explorer 标记](svg-badge.png)：只有 `example.svg` 显示 `[]`，`notes.txt` 和同样以 .svg 结尾的目录没有标记。
- [Outline 与定位](svg-outline-location.png)：依次显示 SVG 根、嵌套分组、带 ID 的矩形及无 ID 的 text。点击 rect#start 后，光标到第 3 行第 6 列。
- [更新](svg-outline-updated.png)、[无效 XML](svg-outline-invalid.png)、[恢复](svg-outline-recovery.png)：在未保存的编辑缓冲区把矩形 ID 改为 renamed，大纲立即更新。替换为不完整 XML 后，Outline 显示无符号。重新输入合法 XML 后，大纲恢复。

如果 VSCode 默认使用图片预览，打开示例目录作为工作区，其设置会将 SVG 关联到文本编辑器。其他工作区也可以使用同一个编辑器关联。验证发现仅临时切到文本编辑器时，Outline 跳转可能重新打开图片预览。
