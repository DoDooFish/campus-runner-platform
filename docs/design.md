# 校园跑腿互助平台——设计方案

## 一、项目定位

产品名称：校园帮帮

目标用户：在校大学生

核心价值：
1. 让“临时需要别人帮忙”的需求快速找到同校同学。
2. 让“顺路帮忙”的学生获得跑腿奖励与信用积累。
3. 用校园认证、信用分、评价体系降低陌生人交易风险。

## 二、核心功能

### 1. 任务大厅
- 任务分类：快递代取、代买物品、代占座、其他
- 关键词搜索
- 任务状态：待接单 / 进行中 / 已完成
- 奖励、地点、截止时间、发布者信用展示

### 2. 发布任务
用户填写：
- 标题
- 类型
- 具体说明
- 校区
- 办事地点
- 截止时间
- 跑腿奖励

### 3. 接单流程

发布任务
→ 跑腿者接单
→ 状态变为“进行中”
→ 跑腿者完成
→ 状态变为“已完成”
→ 双方评价
→ 信用分更新

### 4. 信用体系

信用分初始 96，范围 0~100。

建议正式版本规则：
- 按时完成：+1
- 获得 5 星评价：+1（每日上限）
- 无故爽约：-5
- 恶意取消：-3
- 被投诉并核实：-10

信用等级：
- 90~100：优秀
- 80~89：良好
- 60~79：一般
- 0~59：风险用户

### 5. 我的订单

区分：
- 我发布的
- 我接下的
- 进行中
- 已完成

## 三、页面结构

首页
├── 品牌与个人入口
├── Hero / 产品价值
├── 信用分
├── 数据概览
└── 推荐任务

找任务
├── 搜索
├── 分类筛选
└── 任务列表

发布任务
├── 标题
├── 分类
├── 描述
├── 地点
├── 截止时间
└── 奖励

我的订单
├── 发布任务
└── 接单任务

我的
├── 信用分
├── 完成数量
├── 评分
└── 平台规则

## 四、数据库设计（正式版）

users
- id
- nickname
- avatar_url
- campus
- credit_score
- completed_count
- created_at

tasks
- id
- publisher_id
- runner_id
- title
- description
- category
- campus
- pickup_location
- deadline
- reward
- status
- created_at
- completed_at

ratings
- id
- task_id
- from_user_id
- to_user_id
- score
- comment
- created_at

reports
- id
- task_id
- reporter_id
- target_user_id
- reason
- status
- created_at

## 五、安全与风控

正式上线必须增加：
- 校园邮箱认证
- 敏感词检测
- 订单状态权限校验
- 防重复接单
- 投诉举报
- 黑名单
- 交易记录
- 管理员审核
- 最低 / 最高奖励限制
- 不允许发布违法、危险物品相关任务

## 六、MVP 与正式版差异

本仓库是“前端可交付 MVP”，使用 localStorage，让项目无需后端即可在 GitHub Pages 演示。

正式多人版建议：
React/Vite
+
Supabase Auth
+
Supabase PostgreSQL
+
Supabase Realtime
+
GitHub Actions
+
GitHub Pages / Vercel
