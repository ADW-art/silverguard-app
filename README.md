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
3. 前端启动与验证命令见 [app/README.md](./app/README.md)，设计依据见 [design/README.md](./design/README.md)。
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
- [x] 建立首个功能实现 OpenSpec change
- [x] 老人端首页与本地模拟求助流程可在 H5 运行
- [x] 老人端今日用药与提醒详情可在 H5 运行
- [x] 老人端首页、今日用药与提醒详情完成统一暖金材质、SVG 图标、微动效和减少动效适配
- [x] 老人端生活首页、日历日程与大字计算器可在 H5 运行
- [x] 老人端手电筒已接入 Android 真实 torch，等待自定义基座真机验收
- [x] H5 与 App 平台生产编译通过
- [ ] 服务端数据库迁移和核心业务模块实现
- [ ] Android 真机验收
- [ ] 养老总控制台接口联调

## 重要说明

当前已有可运行的老人端首页、本地模拟求助、今日用药、生活首页、日历日程和大字计算器；手电筒已接入 Android 真实 torch，但还未取得本轮真机证据。这些本地流程不会发送真实通知、拨打电话、同步系统日历、同步医疗数据或写入服务端。实时放大镜仍需要 Android 原生预览能力。Android 详细验收、真实登录、家庭绑定、服务端事件和家属接管尚未完成。最新完成项、未完成项和下一里程碑以 [项目进度](./docs/PROGRESS.md) 为准。后续按“需求确认 → 设计确认 → OpenSpec change → 单任务实现 → 测试/真机验收 → 独立复核”的节奏推进。
