import type { Rating, Task, User } from './types'
import { seedTasks, demoUser } from './data'

const TASK_KEY = 'campus_tasks_v1'
const USER_KEY = 'campus_user_v1'
const RATING_KEY = 'campus_ratings_v1'

export function loadTasks(): Task[] {
  const raw = localStorage.getItem(TASK_KEY)
  if (!raw) {
    localStorage.setItem(TASK_KEY, JSON.stringify(seedTasks))
    return seedTasks
  }
  return JSON.parse(raw)
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks))
}

export function loadUser(): User {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser))
    return demoUser
  }
  return JSON.parse(raw)
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function loadRatings(): Rating[] {
  return JSON.parse(localStorage.getItem(RATING_KEY) || '[]')
}

export function saveRatings(ratings: Rating[]) {
  localStorage.setItem(RATING_KEY, JSON.stringify(ratings))
}