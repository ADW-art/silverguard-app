# SilverGuard Figma 本地构建设计插件

这个插件用于绕过 MCP 调用额度，直接在 Figma Desktop 当前文件中生成 SilverGuard 设计稿。

- `03_Elder 老人端`：17 张 `360 × 800` 页面/状态，覆盖首页、求助、用药、联系人、生活工具、消息、我的和适老化设置。
- `04_Family 子女端`：状态总览与告警详情 2 张页面。
- `05_Prototype 页面跳转`：保留原型说明；求助、用药和生活工具的点击跳转直接建立在老人端页面上。

当前视觉方向为“暖金守护”：保留适老服务界面的暖黄色大入口，使用克制的暖金珍珠釉、局部磨砂玻璃、微颗粒和同心光环。主视觉与高优先入口使用轻量内外阴影建立触感，信息卡保持高不透明与高对比。老人端不展示设备、网络、网关或传感器管理页面；所有页面禁止真实照片、监控画面和摄影背景，并删除重复小字和显性 AI 标签。

## 导入运行

1. 打开 Figma Desktop，并打开 `养老AI主动守护App-UI`。
2. 选择 `Plugins → Development → Import plugin from manifest...`。
3. 选择本目录下的 `manifest.json`。
4. 运行 `Plugins → Development → SilverGuard UI Builder`。

插件会复用文件中已有的 Foundations 变量；重新运行时只替换插件生成的老人端与子女端画板，不修改 Foundations 和 Components。运行前会记录当前 Page、画布中心和缩放，完成后恢复原视图。

如果旧版本一直显示运行中，先按 `Esc` 停止，再重新导入本目录中的 `manifest.json`。更新版不会扫描整个文档，并会在 60 秒后自动停止。
