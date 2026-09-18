# 技术架构

## 1. 分层关系

```text
uni-app 老人端 / 家属端
          │ REST + WebSocket
          ▼
Fastify API
  ├─ auth                 认证与角色
  ├─ elder-profile        老人档案与家庭绑定
  ├─ events               统一事件入口
  ├─ risk-rules           可解释的风险规则，唯一决定等级
  ├─ alerts               告警状态机
  ├─ notifications        家庭通知与接管
  ├─ medication           用药计划与确认
  ├─ simulator            演示事件生成
  ├─ ai-adapter           总结、解释、关怀建议
  └─ integrations         养老总控制台协议适配
          │
          ▼
SQLite + Prisma（MVP）
```

## 2. 事件流

```text
事件产生
  → schema 校验与去重
  → 保存原始事件
  → risk-rules 计算风险
  → 生成/更新告警
  → 必要时通知家庭成员
  → 异步调用 AI 生成摘要或建议
  → 家属确认、处理或升级
  → 同步给控制台适配器并留痕
```

AI 调用失败、超时或额度不足时，不得阻塞“事件保存 → 风险判断 → 必要通知”主链路。

## 3. 关键数据对象

- `User`：登录账号和角色。
- `ElderProfile`：老人基本档案，最小化保存敏感资料。
- `FamilyLink`：老人和家属的授权关系。
- `CareEvent`：统一事件，来源可以是 App、模拟器或未来设备。
- `RiskAlert`：基于规则生成的风险记录和状态。
- `Notification`：面向家属或服务人员的通知及送达状态。
- `MedicationPlan` / `MedicationCheckIn`：用药计划和确认记录。
- `AiInsight`：去标识化输入对应的 AI 摘要、建议和失败状态。
- `IntegrationRecord`：与养老总控制台同步的请求、结果和重试信息。

## 4. 对接边界

现有控制台的真实 URL、鉴权方式、接口字段和推送方式尚未完成确认，必须在联调前以接口文档或抓包证据为准。新服务端先定义自己的稳定领域模型，再在 `integrations` 中做字段映射，不把外部接口字段直接扩散到前端。

## 5. 安全与隐私

- JWT 只用于自建 API；外部控制台凭据独立存储。
- AI 输入采用事件摘要和必要上下文，脱敏后再发送。
- 日志记录事件 ID 和处理结果，不默认记录完整个人信息。
- 所有状态改变接口校验角色、家庭关系和事件归属。
