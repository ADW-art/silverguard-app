# SilverGuard 项目协作规则

## 1. 项目目标与边界

- 项目名称：银龄智护（SilverGuard）。定位为面向独居老人的 AI 主动守护与家庭协同手机 App。
- 比赛目标：在计算机应用大赛第二赛道的要求下，完成可演示、可验证、可解释的完整应用闭环，并体现真实问题、技术实现、创新点和社会价值。
- 原项目 `E:\小程序开发\前端code\elder_care` 仅作为业务内容、页面信息和问题发现的参考资料；禁止复制其前端页面、源码结构、写死数据或直接在原目录开发。
- 本仓库是全新项目。所有新增代码、接口、数据库和设计必须位于本仓库或明确配置的独立服务中。

## 2. 当前技术基线

- App：uni-app + Vue 3 + TypeScript，使用现有 `D:\hbuilder x\HBuilderX\HBuilderX.exe` 开发和运行；界面必须重新设计。
- 服务端：Node.js + TypeScript + Fastify。
- 数据库：SQLite + Prisma，先满足单机/演示和快速落地，再保留迁移到 PostgreSQL 的边界。
- 通信：App ↔ 自建 Fastify REST API；实时提醒预留 WebSocket；未来与养老总控制台使用独立 Integration Adapter 对接。
- 认证：JWT；密钥、模型密钥和控制台凭据只通过 `.env` 或部署环境注入，禁止提交到 Git。
- API 调试：Apifox；流程、需求和变更：OpenSpec；版本管理：Git。
- Android 工具：`E:\Android\Sdk`；Java：`D:\java\jdk-21`。

## 3. 目录约定

```text
app/                    # 全新的 uni-app 前端，不从 elder_care 复制
server/                 # Fastify 服务端和 Prisma
docs/                   # 产品、架构、决策、验收、环境文档
design/                 # 设计稿、设计令牌、交互说明的索引
openspec/               # 需求变更提案、规格和任务
AGENTS.md               # 本文件，项目长期规则
README.md               # 项目入口和运行说明
```

## 4. 业务架构不可违反的规则

1. `risk-rules` 是风险等级的唯一决定者，AI 不得直接改变风险等级、告警等级或通知策略。
2. `ai-adapter` 只负责解释、总结、生成关怀建议和辅助判断；AI 超时或失败时，基础告警链路必须继续工作。
3. 发送给 AI 的内容必须是去标识化的事件摘要，不发送不必要的姓名、手机号、地址、身份证号等敏感信息。
4. 模拟器事件和未来真实设备事件必须实现同一事件接口，确保演示数据能够平滑替换为真实数据。
5. 发现agent.md等信息等说明文档信息变更立即询问用户，确定事实，更新说明文件。
6. 与养老总控制台的协议、鉴权和字段映射必须隔离在 `integrations` 模块，不能污染核心业务模型。

## 5. 开发流程

- 先确认需求、设计和验收标准，再写代码；未确认的方案标记为“候选”，不得伪装成已确定事实。
- 每次只处理一个可验收任务，不顺手重构无关代码。
- 设计先行：先在 `design/` 记录信息架构、关键页面、状态和交互，再实现前端。
- 任何业务变更先建立 OpenSpec change；变更完成后必须同步规格、测试和验收证据。
- 代码完成不等于任务完成：必须运行相关检查，并报告命令、结果、未验证项和截图/真机证据。
- 复杂或有争议的改动先停在提案阶段，等待用户确认，不擅自扩大范围。

## 6. 推荐命令

```powershell
# 服务端
Set-Location .\server
npm install
npm run dev
npm run typecheck
npm run prisma:generate

# OpenSpec
openspec list
openspec validate --all

# Android / 真机
$env:ANDROID_SDK_ROOT = 'E:\Android\Sdk'
$env:Path = 'E:\Android\Sdk\platform-tools;' + $env:Path
adb devices
```


## 7. Git 与完成定义

- 提交应小而聚焦，提交信息说明意图；不提交构建产物、临时下载包和本地 IDE 配置。
- 每完成一个有明确验收证据的重要里程碑，在相关检查通过后自动创建聚焦的 Git commit，无需再次询问用户。若 `origin` 可用且远端历史不会被覆盖，则同步推送；普通试验、未确认方案和不完整中间状态不单独提交。
- 完成定义：需求/设计/代码/测试/文档一致；核心流程可运行；异常路径有说明；用户能按 README 重现；未完成部分被明确列出。
