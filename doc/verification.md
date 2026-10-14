# 实测验证记录

验证日期：2026-10-14。实现与测试脚本版本：`c1f0fd472aea571a5e640970b7ce5d0494facaac`。随后最终提交仅补充项目文档、图示说明与实测报告，生产代码保持该版本。

| 检查 | 环境/操作 | 实测结果 |
|---|---|---|
| 依赖安装 | 从 GitHub 独立 clone，执行 `npm ci` | 成功安装锁文件的 5 个依赖包，官方 registry 审计为 0 vulnerabilities |
| 静态与行为验证 | Windows；Node 20.11.1；npm 10.2.4；TypeScript 5.9.3；`npm run check` | 44 个 src 文件架构检查通过；34 项测试，34 通过、0 失败/跳过 |
| 测试覆盖率 | `npm run test:coverage` | Node 内置报告 all files 行覆盖 99.46%、分支 96.94%、函数 99.71%。这些总数包含编译后的测试文件，不能直接当作仅生产代码的总覆盖率 |
| 真实交互终端 | `npm run cli`；init/create/tree/undo/redo/exit | 显示欢迎语与 `svg>`；命令正常执行，撤销/重做后退出 |
| 附件完整会话 | `node scripts/replay.mjs examples/session.txt` | 仅有两条预期 error：非法祖先分组、save 后 undo；导入 other.svg 为 7 元素并警告分配 rect1 |
| 附件流程图 | `npm run demo` | 无 error；生成 8 元素 SVG；自动测试确认节点矩形与文字一起移动，并在 undo 后恢复保存 |
| 文档图 | PlantUML 1.2024.8，Java 16，Smetana 布局 | 本地生成 architecture.png/svg，并查看 PNG 检查组件、标签和箭头 |
| GitHub CI | Ubuntu/Windows × Node 20/22 | 四组合全部通过，见下面的运行链接 |
| Diff 格式 | `git diff --check` | 通过 |

完整本地输出：[test-report.txt](test-report.txt)。覆盖率逐文件输出：[coverage-report.txt](coverage-report.txt)。

CI 通过的运行：[38541472535](https://github.com/loading-9/pj1-svg-editor/actions/runs/38541472535)，对应上述代码提交。上一轮 CI 的 Node 22 目录测试发现失败没有被隐藏，原因与修正见项目文档的过程记录和 Git 历史。

最终交付核验：附注标签 `final` 必须与 `main`/HEAD 指向同一提交，分支与标签均推送到远程，并通过 `git ls-remote` 比较；这些在最终文档提交后执行，避免为了把提交自己的 hash 写进文档而形成自引用。
