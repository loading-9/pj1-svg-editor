# PJ1 Phase 1 — CLI SVG 编辑器

TypeScript 面向对象实现；六种内置 SVG 图形、嵌套分组、文件读写与命令级撤销重做。

```sh
npm ci
npm run cli
```

需要 Node.js 20 或更新版本。提示符为 `svg>`，输入 `help` 查看命令，`exit`/`quit` 或 EOF 退出。参数含空格时使用双引号；仅以 `#` 开头的整行作为注释，十六进制颜色可以直接输入。

```text
init 400 200
create g scene
create rect r1 30 50 120 60 #4a90d9 in scene
create text title 45 85 "开始" in scene
move scene 20 0
undo
save demo.svg
```

生成的 SVG 可以直接在浏览器打开。完整示例和验证命令：

```sh
npm run demo
npm run demo -- examples/session.txt
npm run check
```

demo 脚本跨平台执行，自动创建 `examples/generated/`。session 示例包含两条预期错误，用于演示非法分组和保存后的历史屏障。仅支持本阶段六种图形；box 属后续插件阶段。

架构方案、PlantUML 图、开发过程、一致性自查、功能验收及质量保证见 [doc/README.md](doc/README.md)。验证证据见 [doc/verification.md](doc/verification.md)，逐条复核结果见 [doc/requirements-audit.md](doc/requirements-audit.md)。

逐步开发提交保存在 Git 历史中，最终版本由附注标签 `final` 标记。
