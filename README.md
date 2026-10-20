# 校园帮帮 · 校园跑腿互助平台

一个面向大学校园的跑腿互助平台 MVP，支持：

- 发布跑腿任务
- 按分类 / 关键词搜索任务
- 查看任务详情
- 接单 / 标记完成
- 奖励金额展示
- 信用分体系
- 完成后互相评价
- 我的订单
- GitHub Pages 自动部署

## 技术栈

- React + TypeScript
- Vite
- Lucide React
- localStorage（MVP 数据层）
- GitHub Actions + GitHub Pages

## 本地运行

```bash
npm install
npm run dev
```

打开终端显示的本地地址。

## 构建

```bash
npm run build
npm run preview
```

## 部署到 GitHub Pages

1. 创建一个 GitHub 仓库，例如 `campus-runner-platform`
2. 将本项目所有文件推送到 `main`
3. GitHub → Settings → Pages
4. Source 选择 `GitHub Actions`
5. 后续每次 push 到 `main` 都会自动构建并部署

## 数据说明

当前版本使用浏览器 localStorage，适合课程设计、作品集和前端 MVP 演示。

如果要做真正的多人在线平台，建议下一阶段接入 Supabase：

- Auth：校园邮箱 / 手机登录
- PostgreSQL：任务、用户、订单、评价
- Row Level Security：权限控制
- Storage：头像 / 凭证图片
- Realtime：订单状态实时更新

## 产品架构

用户
→ 浏览任务
→ 查看详情
→ 接单
→ 完成
→ 评价
→ 信用分变化

发布者
→ 发布任务
→ 等待接单
→ 查看订单
→ 确认完成
→ 评价跑腿者
