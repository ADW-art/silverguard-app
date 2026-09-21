# SilverGuard App

全新的 uni-app + Vue 3 + TypeScript 前端。禁止从旧项目复制页面、组件、结构或写死数据。

当前实现范围包括 `elder-sos-flow`、`elder-medication-flow`、已归档的 `elder-visual-polish`，以及正在实施的 `elder-life-tools`。老人端可运行首页、3 秒长按求助、今日用药、提醒详情、生活首页、日历日程和大字计算器。这些页面共享暖金材质、本地 SVG 图标、按压与状态动效，并支持系统减少动效偏好。开发环境使用本地模拟网关、本机用药存储和本地演示日程，不会发送真实通知、拨打电话、同步系统日历或同步医疗数据。

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

App 平台编译：

```powershell
npm run build:app
```

编译成功后可在 HBuilderX 中导入 `dist\build\app` 并运行到 Android App 基座。该命令只验证 App 平台编译，不等于真机交互验收。

模拟网关默认在等待后返回“王丽已接管”。可在启动前切换结果：

```powershell
$env:VITE_SOS_DEMO_OUTCOME = 'timeout' # 无人响应
$env:VITE_SOS_DEMO_OUTCOME = 'failure' # 发送失败
npm run dev:h5
```

用药演示状态保存在 `silverguard.medication.today.v1`。需要重新体验初始计划时，可清除浏览器站点数据或 App 本地存储后重新进入。

生活首页路径为 `#/pages/elder/life/index`。日历日程与大字计算器为可运行的本地功能；手电筒已接入 Android Camera2 torch，H5 只显示平台能力提示。实时放大镜仍需要可验证的 Android 原生预览能力。平台边界见 [生活工具平台说明](../docs/LIFE_TOOLS_PLATFORM.md)。

## HBuilderX / Android

手电筒新增了 `android.permission.CAMERA` 和可选闪光灯硬件声明。请在 HBuilderX 中制作包含当前 `manifest.json` 的自定义调试基座后测试；标准基座或旧基座可能没有同步本次权限配置。

使用已有的 `D:\hbuilder x\HBuilderX\HBuilderX.exe` 打开本目录，选择“运行到 Android App 基座”。真机验收需要检查：

- 连续长按满 3 秒才发送；提前松手或触摸取消不发送。
- 等待、接管、无人响应和失败状态文字清晰。
- 活跃求助期间再次进入仍显示同一事件。
- 返回行为、底部安全区和 360×800 基准布局正常。

连接手机前可先确认 ADB：

```powershell
& 'E:\Android\Sdk\platform-tools\adb.exe' devices -l
```

设备列表为空时，先在手机中开启开发者选项和 USB 调试，并在手机上确认这台电脑的调试授权。

## 后续接口替换

页面只依赖 `src/features/sos/gateway.ts` 中的 `SosGateway`。接入真实服务端时新增 REST/WebSocket 实现并替换工厂，不在页面中直接写请求或设备协议。
