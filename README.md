# 银龄智护（SilverGuard）

面向独居老人的 AI 主动守护与家庭协同应用，服务于计算机应用大赛第二赛道项目开发。

## 项目原则

这是一个从零建立的新项目。`E:\小程序开发\前端code\elder_care` 只用于了解已有业务内容和控制台对接背景，不作为代码模板，也不在其目录内开发。App 前端重新进行信息架构、视觉和交互设计。

## 目标闭环

老人端产生主动事件或日常状态 → 服务端进行规则化风险判断 → 低风险由 AI 提供解释和关怀建议 → 中高风险触发家庭协同通知 → 家属确认、处理或升级 → 全流程留痕并可在控制台查看。

## 技术栈

- 前端：uni-app、Vue 3、TypeScript
- 后端：Node.js、Fastify、TypeScript、REST、WebSocket 预留
- 数据：SQLite、Prisma
- AI：服务端 `ai-adapter`，可插拔，失败不阻断告警
- 工具：HBuilderX（已有，`D:\hbuilder x\HBuilderX\HBuilderX.exe`）、OpenSpec、Apifox、Git、Android SDK

## 开发入口

1. 阅读 [AGENTS.md](./AGENTS.md) 和 [开发环境说明](./docs/DEVELOPMENT_SETUP.md)。
2. 阅读 [项目进度](./docs/PROGRESS.md)、[产品定义](./docs/PRODUCT.md)、[架构说明](./docs/ARCHITECTURE.md) 和 [验收标准](./docs/ACCEPTANCE.md)。
3. 先完成设计索引 [design/README.md](./design/README.md)，再开始 App 页面实现。
4. 每项功能通过 OpenSpec change 管理，不一次性生成整套未经确认的 App。

## 当前状态

- [x] 新仓库建立，未复制原项目源码
- [x] OpenSpec 初始化
- [x] 服务端基础目录和依赖清单建立
- [x] 开发规范、产品边界、架构和验收文档建立
- [x] 视觉方向、设计系统和老人端 UX 规格确认
- [x] 老人端 17 张页面/状态及主要点击路径生成
- [x] 家属端功能范围、UX 规格和跨角色告警状态确认
- [ ] 家属端完整页面和跨角色点击原型生成
- [ ] 建立首个功能实现 OpenSpec change
- [ ] 服务端数据库迁移和核心业务模块实现
- [ ] uni-app 前端实现与真机验收
- [ ] 养老总控制台接口联调

## 重要说明

当前已完成工程基础、视觉基线、老人端第一轮完整设计，以及家属端与跨角色告警的正式规格；家属端完整页面尚未生成，也尚未进入业务功能实现，不宣称已有可运行 App。最新完成项、未完成项和下一里程碑以 [项目进度](./docs/PROGRESS.md) 为准。后续按“需求确认 → 设计确认 → OpenSpec change → 单任务实现 → 测试/真机验收 → 独立复核”的节奏推进。
