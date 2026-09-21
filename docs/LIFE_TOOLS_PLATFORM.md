# 老人端生活工具平台说明

## 当前可运行范围

- 生活首页：显示今日日期、安排摘要、四项工具入口和下一条安排。
- 日历日程：本地 42 格月历、月份切换、日期选择、农历标签、安排列表和空状态。
- 大字计算器：加减乘除、小数、正负号、连续运算、清除与除零保护。

日程暂时来自本地演示仓储，不会读取或修改系统日历，也不会同步给家属。

## Android 原生能力边界

### 手电筒

当前实现通过 HTML5+ Native.js 调用 Android `CameraManager.setTorchMode`，并在打开前检查 Android API 版本、闪光灯硬件与相机权限。控制器串行处理开启和关闭，在离页、切后台或开启过程中发生取消时关闭 torch。H5 只说明当前平台不支持，不用屏幕变亮或按钮动画冒充手电筒。

相关官方依据：

- [Android CameraManager](https://developer.android.com/reference/android/hardware/camera2/CameraManager)：`setTorchMode`、相机占用和服务异常边界。
- [Android PackageManager](https://developer.android.com/reference/android/content/pm/PackageManager)：`FEATURE_CAMERA_FLASH` 硬件能力。
- [HTML5+ Native.js for Android](https://www.html5plus.org/doc/zh_cn/android.html)：`plus.android`、权限申请和原生 API 调用。
- [uni-app Android 权限配置](https://uniapp.dcloud.net.cn/tutorial/app-permission-android.html)：`manifest.json` 相机权限声明。

App 平台编译已经通过；真实灯光、首次权限弹窗、永久拒绝、相机占用和离页关闭仍需使用包含当前权限声明的 Android 自定义调试基座验收。

### 实时放大镜

当前项目使用标准 uni-app。标准 uni-app 的内置 `camera` 组件不支持 App 内嵌相机预览，因此实时放大镜需要原生插件、原生视图，或经评估后调整技术基线。能力完成并通过 Android 设备验证前，不使用静态图片或预录内容冒充实时画面。

## 验证原则

- H5 负责验证信息架构、路由、布局、计算和日历领域规则。
- App 生产编译成功只证明平台代码可编译，不等于硬件功能验收完成。
- 手电筒和放大镜必须在 Android 设备上记录权限、前后台切换、返回键和资源释放结果后，才能标记完成。
