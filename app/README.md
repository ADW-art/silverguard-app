# SilverGuard App

全新的 uni-app + Vue 3 + TypeScript 前端。禁止从旧项目复制页面、组件、结构或写死数据。

当前实现范围是 `elder-sos-flow`：老人端首页、3 秒长按求助、等待家属、已接管、无人响应和失败反馈。开发环境使用本地模拟网关，不会发送真实通知或拨打电话。

## 命令行运行

```powershell
npm install
npm run type-check
npm test
npm run dev:h5
```

H5 生产构建：

```powershell
npm run build:h5
```

模拟网关默认在等待后返回“王丽已接管”。可在启动前切换结果：

```powershell
$env:VITE_SOS_DEMO_OUTCOME = 'timeout' # 无人响应
$env:VITE_SOS_DEMO_OUTCOME = 'failure' # 发送失败
npm run dev:h5
```

## HBuilderX / Android

使用已有的 `D:\hbuilder x\HBuilderX\HBuilderX.exe` 打开本目录，选择“运行到 Android App 基座”。真机验收需要检查：

- 连续长按满 3 秒才发送；提前松手或触摸取消不发送。
- 等待、接管、无人响应和失败状态文字清晰。
- 活跃求助期间再次进入仍显示同一事件。
- 返回行为、底部安全区和 360×800 基准布局正常。

## 后续接口替换

页面只依赖 `src/features/sos/gateway.ts` 中的 `SosGateway`。接入真实服务端时新增 REST/WebSocket 实现并替换工厂，不在页面中直接写请求或设备协议。
