import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, Bell, CheckCircle2, ChevronRight, Clock3, HandHeart,
  Home, ListChecks, MapPin, MessageCircle, Plus, Search, ShieldCheck,
  Star, UserRound, Wallet, X
} from 'lucide-react'
import type { Category, Rating, Status, Task, User } from './types'
import { categories } from './data'
import { loadRatings, loadTasks, loadUser, saveRatings, saveTasks, saveUser } from './storage'

type Tab = 'home' | 'tasks' | 'publish' | 'orders' | 'profile'

const categoryIcon: Record<string, string> = {
  '快递代取': '📦',
  '代买物品': '🛍️',
  '代占座': '💺',
  '其他': '✨',
}

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [tasks, setTasks] = useState<Task[]>([])
  const [user, setUser] = useState<User>(loadUser())
  const [ratings, setRatings] = useState<Rating[]>(loadRatings())
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('全部')
  const [toast, setToast] = useState('')
  const [showDetail, setShowDetail] = useState<Task | null>(null)

  useEffect(() => setTasks(loadTasks()), [])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2400); return () => clearTimeout(t) } }, [toast])

  const filtered = useMemo(() => tasks.filter(t =>
    (category === '全部' || t.category === category) &&
    (t.title + t.description + t.pickup).toLowerCase().includes(search.toLowerCase())
  ), [tasks, category, search])

  const update = (next: Task[]) => { setTasks(next); saveTasks(next) }
  const updateUser = (next: User) => { setUser(next); saveUser(next) }

  function acceptTask(task: Task) {
    if (task.publisher === user.name) return setToast('不能接自己发布的任务')
    const next = tasks.map(t => t.id === task.id ? { ...t, status: '进行中' as Status, runner: user.name } : t)
    update(next)
    setShowDetail(null)
    setToast('接单成功！请按时完成任务。')
  }

  function completeTask(task: Task) {
    const next = tasks.map(t => t.id === task.id ? { ...t, status: '已完成' as Status } : t)
    update(next)
    updateUser({ ...user, credit: Math.min(100, user.credit + 1), completed: user.completed + 1 })
    setToast('任务已完成，信用分 +1')
  }

  function publishTask(form: Omit<Task, 'id' | 'publisher' | 'publisherCredit' | 'status' | 'createdAt'>) {
    const task: Task = {
      ...form,
      id: crypto.randomUUID(),
      publisher: user.name,
      publisherCredit: user.credit,
      status: '待接单',
      createdAt: '刚刚',
    }
    update([task, ...tasks])
    updateUser({ ...user, published: user.published + 1 })
    setTab('tasks')
    setToast('任务发布成功，等待同学接单！')
  }

  function rateTask(taskId: string, score: number, comment: string) {
    const next = [...ratings, { id: crypto.randomUUID(), taskId, from: user.name, score, comment }]
    setRatings(next); saveRatings(next); setToast('评价已提交，感谢你的反馈！')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" onClick={() => setTab('home')}>
          <div className="brand-mark"><HandHeart size={20}/></div>
          <div><strong>校园帮帮</strong><span>校内跑腿互助</span></div>
        </div>
        <div className="top-actions">
          <button className="icon-btn" title="通知"><Bell size={19}/><i /></button>
          <div className="mini-user" onClick={() => setTab('profile')}>
            <div className="avatar">L</div><span>{user.name}</span>
          </div>
        </div>
      </header>

      <main className="main">
        {tab === 'home' && (
          <HomeView
            user={user}
            tasks={tasks}
            onTask={(t) => setShowDetail(t)}
            onPublish={() => setTab('publish')}
            onExplore={() => setTab('tasks')}
          />
        )}
        {tab === 'tasks' && (
          <TaskView tasks={filtered} search={search} category={category} setSearch={setSearch}
            setCategory={setCategory} onTask={setShowDetail} onPublish={() => setTab('publish')} />
        )}
        {tab === 'publish' && <PublishView onSubmit={publishTask} onCancel={() => setTab('home')} />}
        {tab === 'orders' && (
          <OrdersView tasks={tasks} user={user} onComplete={completeTask} onTask={setShowDetail} />
        )}
        {tab === 'profile' && <ProfileView user={user} ratings={ratings} />}
      </main>

      <nav className="bottom-nav">
        {([
          ['home', Home, '首页'], ['tasks', Search, '找任务'], ['publish', Plus, '发布'],
          ['orders', ListChecks, '我的订单'], ['profile', UserRound, '我的']
        ] as const).map(([id, Icon, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            <Icon size={21}/><span>{label}</span>
          </button>
        ))}
      </nav>

      {showDetail && (
        <TaskModal task={showDetail} user={user} onClose={() => setShowDetail(null)}
          onAccept={acceptTask} onComplete={completeTask} onRate={rateTask} ratings={ratings}/>
      )}
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  )
}

function HomeView({ user, tasks, onTask, onPublish, onExplore }: {
  user: User; tasks: Task[]; onTask: (t: Task) => void; onPublish: () => void; onExplore: () => void
}) {
  return <div className="page home-page">
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><ShieldCheck size={15}/> 校内实名互助 · 信用保障</div>
        <h1>让校园里的每一次<br/><em>举手之劳</em>都有回应</h1>
        <p>代取快递、代买物品、代占座……发布需求，也可以顺手帮助身边的同学。</p>
        <div className="hero-actions">
          <button className="primary" onClick={onPublish}><Plus size={18}/> 发布任务</button>
          <button className="secondary" onClick={onExplore}>浏览任务 <ArrowRight size={17}/></button>
        </div>
      </div>
      <div className="hero-card">
        <div className="hero-card-title">我的信用</div>
        <div className="credit-ring"><b>{user.credit}</b><span>信用分</span></div>
        <div className="credit-note"><ShieldCheck size={15}/> 信用良好，可优先接单</div>
      </div>
    </section>

    <section className="quick-stats">
      <div><b>{tasks.filter(t => t.status === '待接单').length}</b><span>待接任务</span></div>
      <div><b>98%</b><span>任务完成率</span></div>
      <div><b>4.9</b><span>平均评分</span></div>
      <div><b>1,286</b><span>今日互助</span></div>
    </section>

    <section className="section-head"><div><span className="eyebrow">RECOMMEND</span><h2>附近的任务</h2></div><button className="text-btn" onClick={onExplore}>查看全部 <ChevronRight size={16}/></button></section>
    <div className="task-grid">
      {tasks.slice(0, 3).map(t => <TaskCard key={t.id} task={t} onClick={() => onTask(t)}/>)}
    </div>
  </div>
}

function TaskView({ tasks, search, category, setSearch, setCategory, onTask, onPublish }: {
  tasks: Task[]; search: string; category: (typeof categories)[number]; setSearch: (s: string) => void;
  setCategory: (c: (typeof categories)[number]) => void; onTask: (t: Task) => void; onPublish: () => void
}) {
  return <div className="page">
    <div className="page-title"><div><span className="eyebrow">TASK MARKET</span><h1>找任务</h1><p>选择你顺路能帮忙的事情，赚取奖励和信用。</p></div><button className="primary" onClick={onPublish}><Plus size={18}/> 发布任务</button></div>
    <div className="filters">
      <div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索任务、地点..." /></div>
      <div className="chips">{categories.map(c => <button key={c} className={category === c ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>{c}</button>)}</div>
    </div>
    <div className="list">{tasks.map(t => <TaskCard key={t.id} task={t} onClick={() => onTask(t)}/>)}</div>
    {tasks.length === 0 && <EmptyState/>}
  </div>
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  return <article className="task-card" onClick={onClick}>
    <div className="task-icon">{categoryIcon[task.category]}</div>
    <div className="task-body">
      <div className="task-top"><span className="tag">{task.category}</span><span className={'status ' + (task.status === '待接单' ? 'waiting' : task.status === '进行中' ? 'doing' : 'done')}>{task.status}</span></div>
      <h3>{task.title}</h3><p>{task.description}</p>
      <div className="task-meta"><span><MapPin size={14}/>{task.pickup}</span><span><Clock3 size={14}/>{task.deadline}</span></div>
      <div className="task-foot"><span className="publisher"><span className="avatar small">{task.publisher[0]}</span>{task.publisher} · 信用 {task.publisherCredit}</span><strong>¥{task.reward}<small> 奖励</small></strong></div>
    </div>
    <ChevronRight className="card-arrow" size={19}/>
  </article>
}

function PublishView({ onSubmit, onCancel }: { onSubmit: (f: Omit<Task, 'id'|'publisher'|'publisherCredit'|'status'|'createdAt'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: '', description: '', category: '快递代取' as Category, campus: '东校区', pickup: '', deadline: '', reward: 5
  })
  const change = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))
  return <div className="page narrow">
    <div className="page-title"><div><span className="eyebrow">CREATE TASK</span><h1>发布任务</h1><p>把你的需求说清楚，附近的同学会看到。</p></div></div>
    <form className="form-card" onSubmit={e => { e.preventDefault(); if (!form.title || !form.pickup || !form.deadline) return; onSubmit(form) }}>
      <label>任务标题<input required value={form.title} onChange={e => change('title', e.target.value)} placeholder="例如：帮我取一下菜鸟驿站的快递"/></label>
      <label>任务类型<select value={form.category} onChange={e => change('category', e.target.value)}>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select></label>
      <label>具体说明<textarea rows={4} value={form.description} onChange={e => change('description', e.target.value)} placeholder="补充取件码、商品规格、放置位置等信息"/></label>
      <div className="form-row"><label>校区<select value={form.campus} onChange={e => change('campus', e.target.value)}><option>东校区</option><option>西校区</option><option>南校区</option></select></label><label>取/办事地点<input required value={form.pickup} onChange={e => change('pickup', e.target.value)} placeholder="例如：东区菜鸟驿站"/></label></div>
      <div className="form-row"><label>截止时间<input required value={form.deadline} onChange={e => change('deadline', e.target.value)} placeholder="例如：今天 18:30"/></label><label>跑腿奖励<input type="number" min="0" value={form.reward} onChange={e => change('reward', Number(e.target.value))}/></label></div>
      <div className="notice"><ShieldCheck size={18}/><span>建议根据距离和任务难度合理设置奖励。完成任务后，双方可互相评价。</span></div>
      <div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>取消</button><button className="primary" type="submit">发布任务 <ArrowRight size={17}/></button></div>
    </form>
  </div>
}

function OrdersView({ tasks, user, onComplete, onTask }: { tasks: Task[]; user: User; onComplete: (t: Task) => void; onTask: (t: Task) => void }) {
  const mine = tasks.filter(t => t.runner === user.name || t.publisher === user.name)
  return <div className="page">
    <div className="page-title"><div><span className="eyebrow">MY ORDERS</span><h1>我的订单</h1><p>管理你发布和接下的任务。</p></div></div>
    <div className="list">{mine.map(t => <article className="order-row" key={t.id} onClick={() => onTask(t)}>
      <div className="task-icon">{categoryIcon[t.category]}</div><div className="order-main"><b>{t.title}</b><span>{t.publisher === user.name ? '我发布的' : '我接下的'} · {t.status}</span></div>
      <strong>¥{t.reward}</strong>
      {t.runner === user.name && t.status === '进行中' && <button className="small-primary" onClick={e => {e.stopPropagation(); onComplete(t)}}>完成任务</button>}
    </article>)}</div>
    {mine.length === 0 && <EmptyState text="还没有订单，去找个任务试试吧！"/>}
  </div>
}

function ProfileView({ user, ratings }: { user: User; ratings: Rating[] }) {
  const avg = ratings.length ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1) : '5.0'
  return <div className="page narrow">
    <div className="profile-hero"><div className="profile-avatar">L</div><h1>{user.name}</h1><span className="verified"><ShieldCheck size={14}/> 校园认证</span></div>
    <div className="profile-stats"><div><b>{user.credit}</b><span>信用分</span></div><div><b>{user.completed}</b><span>完成任务</span></div><div><b>{avg}</b><span>我的评分</span></div><div><b>{user.published}</b><span>发布任务</span></div></div>
    <div className="profile-card"><h3><ShieldCheck size={18}/> 信用等级：优秀</h3><p>保持按时完成、友好沟通和真实评价，你的信用分会持续提升。</p><div className="progress"><i style={{width: `${user.credit}%`}}/></div><div className="progress-label"><span>0</span><span>当前 {user.credit}</span><span>100</span></div></div>
    <div className="profile-card"><h3><Star size={18}/> 平台规则</h3><ul><li>完成任务 +1 信用分</li><li>爽约或恶意取消可能降低信用分</li><li>信用分越高，越容易获得优质任务</li></ul></div>
  </div>
}

function TaskModal({ task, user, onClose, onAccept, onComplete, onRate, ratings }: {
  task: Task; user: User; onClose: () => void; onAccept: (t: Task) => void; onComplete: (t: Task) => void;
  onRate: (id: string, score: number, comment: string) => void; ratings: Rating[]
}) {
  const [score, setScore] = useState(5); const [comment, setComment] = useState('')
  const rated = ratings.some(r => r.taskId === task.id && r.from === user.name)
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
    <button className="close" onClick={onClose}><X size={20}/></button>
    <div className="modal-icon">{categoryIcon[task.category]}</div><span className="tag">{task.category}</span><h2>{task.title}</h2><p className="modal-desc">{task.description}</p>
    <div className="detail-grid"><div><span>地点</span><b><MapPin size={15}/>{task.pickup}</b></div><div><span>截止</span><b><Clock3 size={15}/>{task.deadline}</b></div><div><span>发布者</span><b><UserRound size={15}/>{task.publisher} · {task.publisherCredit}分</b></div><div><span>奖励</span><b className="reward">¥{task.reward}</b></div></div>
    {task.status === '已完成' && !rated && task.publisher !== user.name && <div className="rating-box"><h3>任务完成了，给对方一个评价吧</h3><div className="stars">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setScore(n)} className={n <= score ? 'selected' : ''}>★</button>)}</div><input value={comment} onChange={e => setComment(e.target.value)} placeholder="说说这次互助体验..." /><button className="primary full" onClick={() => onRate(task.id, score, comment)}>提交评价</button></div>}
    <div className="modal-actions">
      {task.status === '待接单' && task.publisher !== user.name && <button className="primary full" onClick={() => onAccept(task)}><HandHeart size={18}/> 我要接单</button>}
      {task.status === '进行中' && task.runner === user.name && <button className="primary full" onClick={() => onComplete(task)}><CheckCircle2 size={18}/> 标记完成</button>}
      {task.status === '已完成' && <div className="completed"><CheckCircle2 size={18}/> 任务已完成</div>}
    </div>
  </div></div>
}

function EmptyState({ text = '没有找到符合条件的任务' }: { text?: string }) {
  return <div className="empty"><div>🔎</div><h3>{text}</h3><p>换个关键词或分类试试看。</p></div>
}

export default App