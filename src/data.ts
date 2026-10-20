import type { Task, User } from './types'

export const demoUser: User = {
  name: 'LUNA同学',
  credit: 96,
  completed: 12,
  published: 5,
}

export const seedTasks: Task[] = [
  {
    id: '1',
    title: '帮我取一下菜鸟驿站的快递',
    description: '一个中等大小的纸箱，凭取件码即可领取，放到宿舍楼下即可。',
    category: '快递代取',
    campus: '东校区',
    pickup: '东区菜鸟驿站',
    deadline: '今天 18:30',
    reward: 5,
    publisher: '小林',
    publisherCredit: 98,
    status: '待接单',
    createdAt: '10分钟前',
  },
  {
    id: '2',
    title: '帮买两杯冰美式',
    description: '从校内咖啡店带回两杯冰美式，无糖少冰。',
    category: '代买物品',
    campus: '东校区',
    pickup: '图书馆一楼咖啡店',
    deadline: '今天 16:40',
    reward: 8,
    publisher: 'Momo',
    publisherCredit: 94,
    status: '待接单',
    createdAt: '25分钟前',
  },
  {
    id: '3',
    title: '图书馆三楼帮占一个座',
    description: '靠窗或电源位优先，拍照确认座位即可。',
    category: '代占座',
    campus: '西校区',
    pickup: '图书馆三楼',
    deadline: '今天 17:00',
    reward: 3,
    publisher: '阿泽',
    publisherCredit: 91,
    status: '进行中',
    runner: '小王',
    createdAt: '40分钟前',
  },
]

export const categories = ['全部', '快递代取', '代买物品', '代占座', '其他'] as const