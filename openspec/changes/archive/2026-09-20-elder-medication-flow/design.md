# Design: 老人端今日用药流程

## 页面结构

E05 顶部只显示“今日还剩几次”和下一次时间，下方使用三行计划列表。每行只显示时间、药品、剂量和一个状态，不增加解释卡片。E06 使用一张暖金主卡显示时间、药品和剂量，下面只保留“确认已服药”“稍后提醒”和“联系家人”三个分层动作。

## 状态模型

每条计划使用 `upcoming | reminding | completed | missed`。`confirm` 只能把 `upcoming`、`reminding` 或 `missed` 更新为 `completed`；已完成项目再次确认时保持原状态并返回 `already-completed`。`snooze` 只允许用于 `reminding`，更新为 `upcoming` 并记录新的提醒时间。

## 数据边界

页面依赖 `MedicationRepository`，首版实现使用 `uni.getStorageSync` 和 `uni.setStorageSync`。演示计划首次进入时初始化三条固定样例；仓储不包含医疗判断。未来 REST 实现可以替换仓储，不改页面动作语义。

## 适老化与文案

- 正文不小于 18px，主要时间和确认按钮更大。
- 每个按钮只表达一次动作，不在按钮下重复解释。
- 状态使用文字与颜色共同表达。
- “已错过”只描述记录状态，不给出补服建议。
- 操作完成后提供清晰的结果反馈，并支持返回今日计划。
