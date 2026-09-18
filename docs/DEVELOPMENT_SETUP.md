# 开发环境说明

## 已配置

| 工具 | 位置/状态 | 用途 |
| --- | --- | --- |
| Node.js | `D:\nodejs\node.exe`，v24.15.0 | 前端和服务端运行时 |
| npm | v11.12.1，前缀 `D:\nodejs\node_global` | 包管理 |
| Git | `D:\git\Git\cmd\git.exe` | 版本管理 |
| GitHub CLI | `C:\Program Files\GitHub CLI\gh.exe` | 后续仓库协作，可选 |
| Java | `D:\java\jdk-21` | Android 工具链 |
| HBuilderX | `D:\hbuilder x\HBuilderX\HBuilderX.exe` | uni-app IDE；已有，不重复安装 |
| OpenSpec | 全局 npm，v1.13.0 | 需求变更和规格管理 |
| Apifox | `E:\tools\Apifox\Apifox.exe` | REST/WebSocket 调试和接口文档 |
| Android SDK | `E:\Android\Sdk` | Android 构建和真机调试 |
| adb | `E:\Android\Sdk\platform-tools\adb.exe` | 连接 Android 真机 |

## Android SDK 已安装组件

- `platform-tools`
- `platforms;android-35`
- `build-tools;35.0.0`
- `cmdline-tools;latest`

用户环境变量已配置：`JAVA_HOME`、`ANDROID_SDK_ROOT`、`ANDROID_HOME`、`GRADLE_USER_HOME`，以及 Android 命令目录到用户 `Path`。

## 尚未安装或不强制安装

- Android Studio：winget 在指定 E 盘位置没有可用安装包，因此没有改为偷偷安装到 C 盘。当前命令行 SDK、adb 和 HBuilderX 已足够开始 uni-app 的基础开发；如果后续需要 Android Studio 的图形化 Logcat/模拟器，再单独处理安装位置。
- Postman：不与 Apifox 重复安装。

## 首次使用检查

```powershell
Get-Command openspec
openspec --version
Get-Item 'D:\hbuilder x\HBuilderX\HBuilderX.exe'
adb version
adb devices
```

## 约束

- 不要执行 `npm install -g` 把项目依赖混入全局；项目依赖放在 `server/package.json` 和未来 `app/package.json`。
- 不要把 SDK、HBuilderX、下载压缩包或编译产物提交到仓库。
- HBuilderX 使用用户现有目录 `D:\hbuilder x`，本项目不再创建第二份 HBuilderX。
