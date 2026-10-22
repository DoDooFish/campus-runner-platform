# 校园帮帮 3.0

这版升级了字号、对比度、卡片信息层级与移动端排版，并加入 Supabase Auth、PostgreSQL 持久化、任务发布/接单/完成/取消、实时任务更新、个人资料、信用分、互助值与评价入口。

## 先了解当前状态

- 没有配置云端环境变量时，网站会以演示模式展示示例任务；演示数据**不会**被说成已写入数据库。
- 真正的用户账号和多人共享数据使用你自己的 Supabase 项目。需要你创建项目并提供 Project URL 与 publishable/anon key。
- 当前地图是交互式示意图，不是真实 GPS 路线。真实定位、ETA 与路线规划需要地图 API 和用户授权。
- AI 推荐目前按奖励与距离做规则排序，不冒充真实大模型；接入真实 AI 需要安全的服务端/Edge Function。

## 1. 创建并初始化云数据库

1. 打开 https://supabase.com/ 并创建项目。
2. 进入项目 SQL Editor，执行 `supabase/migrations/202610210001_init.sql` 的全部内容。
3. 在 Project Settings → API 中复制 Project URL 和 publishable key（旧版控制台可能显示 anon key）。
4. 在 Authentication → URL Configuration 中配置：
   - Site URL：`https://dodoofish.github.io`
   - Redirect URLs：`https://dodoofish.github.io/campus-runner-platform/`
   - 本地开发可增加 `http://localhost:5173/campus-runner-platform/`
5. 若启用邮箱验证，注册后需按邮件完成验证；生产环境建议配置 SMTP。

数据库表：
- `profiles`：昵称、学校/校区、信用分、互助值、完成数、角色
- `tasks`：任务内容、奖励、地点、截止时间、发布人、接单人和状态
- `reviews`：评分、评价与信用更新
- Auth 触发器会在用户注册后自动创建 profile；RLS 策略保护数据；接单/完成/取消由数据库函数执行。

## 2. 本地运行

复制 `.env.example` 为 `.env.local`，填入你的真实配置：

```env
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的publishable或anon-key
```

再运行：

```bash
npm install
npm run dev
```

**不要把 Supabase `service_role` key 放到前端、`.env` 或任何公开仓库。** 浏览器端只能使用 publishable/anon key，并依靠数据库 RLS 限制权限。

## 3. 发布到原来的 GitHub Pages

仓库继续使用 `DoDooFish/campus-runner-platform`，无需新建仓库。到 GitHub 仓库：

1. Settings → Secrets and variables → Actions → New repository secret。
2. 添加 `VITE_SUPABASE_URL`，值为 Supabase Project URL。
3. 添加 `VITE_SUPABASE_ANON_KEY`，值为 publishable/anon key。
4. Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
5. 把本项目文件复制到原项目目录（保留原 `.git` 目录），提交并推送 `main` 分支。工作流会自动部署。

线上地址仍是： https://dodoofish.github.io/campus-runner-platform/

如果没有配置 Actions Secrets，UI 仍会部署，但会显示预览模式，云端登录和数据功能不会启用。

## 4. 设置管理员账号

先通过正常注册创建自己的账号，再在 Supabase SQL Editor 里将邮箱替换成你自己的邮箱执行：

```sql
update public.profiles p set role = 'admin'
from auth.users u where p.id = u.id and u.email = '你的注册邮箱';
```

角色只能由可信数据库管理者设置。管理后台入口受数据库 `profiles.role` 控制；前端隐藏按钮不是安全边界，数据库 RLS 才是。

## 5. 上线前检查

- [ ] SQL 迁移执行成功，Realtime 已启用
- [ ] 配置 Supabase URL、publishable/anon key 和 Auth 回调地址
- [ ] 测试注册、邮箱验证、登录和退出
- [ ] 使用两个账号测试并发接单，确认不会重复接单
- [ ] 测试完成、取消、评价权限
- [ ] 确认未暴露 service role key
- [ ] 桌面和手机分别检查页面
- [ ] 如需真实地图、路线或大模型，接入对应服务并在服务端保护密钥

## Git 更新

保留旧项目的 `.git` 目录，不要重新 `git init`：

```powershell
git add .
git commit -m "feat: upgrade campus runner to v3 with auth and database"
git push
```


## 3.0 时间校验与演示任务补丁（2026-10-22）

- 已有数据库只需在 Supabase SQL Editor 执行 `supabase/migrations/202610220001_task_deadline_guard.sql`，不要重复运行初始化 SQL。新数据库先执行初始化，再执行此增量迁移。
- 截止时间可留空。填写时按浏览器本地时间选择，分钟选择器向上取整到下一可用分钟；提交时重新按实际当前时间校验，接口转为 UTC ISO 时间再保存。数据库使用服务器时钟拒绝过期时间（包括直接绕过网页的写入）。历史任务不会被清除，过期后仍可完成或取消。
- 页面顶部可开启演示任务；未配置云端时默认开启，已配置时默认关闭。5 位虚构同学覆盖快递、代买、占座、资料、其他分类，支持搜索、筛选、详情、模拟接单和模拟完成。演示标记始终可见，数据只在当前页面内存中，刷新或点击“重置演示”恢复；不会创建云端用户、订单、评价或信用记录。接单后会从待接市场移除，详情保留以便模拟完成。
- 验证：选择过去时间应被拦截；页面停留后提交已经过期的选择应报错且保留表单；未来时间应正常发布；留空应正常发布。真实发布需已登录并配置 Supabase。演示开启后分别搜索“咖啡”“打印”、切换全部分类、打开详情并模拟接单，云端不应出现演示记录。
- 部署：先执行增量 SQL，再运行 `npm run build`。只提交本次改动的源码、README 和新增迁移，推送 main 后现有 GitHub Actions 会部署 Pages。不要加入构建缓存、备份目录或任何密钥。
