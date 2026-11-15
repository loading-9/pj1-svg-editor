# ADR 002：box 的结构、读回与降级

状态：采用。

Box 继承公开 Composite 容器 Group。必要的直接子节点为 `<id>-rect`（rect）和 `<id>-label`（text）；初始框体填色 #4a90d9，标题位于 x+20、y+35。允许加入其他子节点，包括嵌套 box。框体与标题的形状字段仍由各自的领域对象封装。

创建先在脱离文档的子树内完成，再由 SvgDocument.add 遍历整个新增子树检查全局 ID；包括派生 ID 与文档已有 ID 的冲突。失败没有任何新增节点。Box.remove 拒绝移除必要部件，因此 delete/addto/group/front/back 等借助普通树操作也不能把部件拆走。允许移动、缩放或修改部件属性；允许整体删除 box。ungroup 通过公开 composite 能力通用拒绝，不在内核写 box 分支。

序列化为普通 g + data-kind=box + 子节点。BoxProvider.accepts 识别该标记，priority=10，优先于优先级 0 的普通 g 提供器。安装插件时，在读完整棵子树后调用 validate：缺少部件或类型错误则拒绝整个 read，保留旧文档；不静默生成残缺对象。重复 ID 在读取前扫描即拒绝，不以降级掩盖。

未安装插件时普通 g 提供器接收该树，保留 data-kind、子图形和绘图外观，语义降为普通 g。重新安装后再读取可恢复 box，只要必要结构仍然合法。降级期间若拆掉必要部件，之后安装插件会明确拒绝。

克隆保留 Box 子类身份；无论 undo、redo 或 save/read 都继续遵守不变量。坐标语义沿用 Phase 1 的仿射补偿。

验证：tests/box.unit.test.ts 和 tests/box.integration.test.ts 的独立替身测试、嵌套/派生 ID/保护部件/一次撤销及 malformed/duplicate/downgrade 测试。doc/transcript/box.txt 回放版本 B。
