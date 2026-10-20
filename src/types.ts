export type Category = '快递代取' | '代买物品' | '代占座' | '其他'
export type Status = '待接单' | '进行中' | '已完成'

export interface Task {
  id: string
  title: string
  description: string
  category: Category
  campus: string
  pickup: string
  deadline: string
  reward: number
  publisher: string
  publisherCredit: number
  status: Status
  runner?: string
  createdAt: string
}

export interface User {
  name: string
  credit: number
  completed: number
  published: number
}

export interface Rating {
  id: string
  taskId: string
  from: string
  score: number
  comment: string
}