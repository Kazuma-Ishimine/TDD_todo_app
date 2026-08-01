import { useState } from 'react'

import { TodoItem } from './TodoItem'

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
  appId: string
}

type Props = {
  todos: Todo[]
  appId: string
  onRefresh: () => void
}

/**
 * Renders a list of todo items.
 */
export function TodoList({ todos, appId, onRefresh }: Props) {
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest')

  if (todos.length === 0) {
    return <p className="text-gray-500 text-center py-4">No todos yet. Create your first todo!</p>
  }

  const sortedTodos = [...todos].sort((left, right) => {
    if (sort === 'title') return left.title.localeCompare(right.title)
    const comparison = left.createdAt.localeCompare(right.createdAt)
    return sort === 'newest' ? -comparison : comparison
  })

  return (
    <div className="space-y-2">
      <label className="flex items-center justify-end gap-2 text-sm">
        Sort todos
        <select value={sort} onChange={(event) => setSort(event.currentTarget.value as typeof sort)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title</option>
        </select>
      </label>
      {sortedTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} appId={appId} onRefresh={onRefresh} />
      ))}
    </div>
  )
}
