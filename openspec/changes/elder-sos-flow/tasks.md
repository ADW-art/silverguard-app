## 1. 工程基础

- [x] 1.1 建立 uni-app + Vue 3 + TypeScript 工程与老人端启动页；运行 `npm install` 和 `npm run type-check` 验证依赖与类型。
- [x] 1.2 建立暖金 tokens、基础按钮和卡片样式；通过 H5 构建确认样式资源可编译。

## 2. 求助领域与交互

- [x] 2.1 实现纯求助状态机，覆盖常态、长按、发送、等待、已接管、无人响应和失败；运行 `npm test` 验证合法转换和重复触发。
- [x] 2.2 实现 `SosGateway` 与本地模拟网关；使用自动化测试验证接管、超时和失败事件。
- [x] 2.3 实现老人端首页、3 秒长按取消、求助进度和结果状态层；运行 `npm run build:h5` 验证页面可编译。
- [x] 2.4 实现再次联系和紧急电话演示反馈，并验证活跃求助期间不会创建第二条事件。

## 3. 验收与文档

- [x] 3.1 运行 `npm run type-check`、`npm test`、`npm run build:h5` 和 `openspec validate elder-sos-flow --strict`，记录结果并修复失败。
- [x] 3.2 更新 app 运行说明与项目进度，明确本地模拟边界和 Android 真机待验收项。
- [ ] 3.3 使用 `D:\hbuilder x\HBuilderX\HBuilderX.exe` 在 Android 真机验证长按、松手取消、页面返回和安全区；将设备与结果记录到验收文档后再勾选本项。
