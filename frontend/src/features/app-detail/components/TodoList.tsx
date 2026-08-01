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
  const [deletedTodoIds, setDeletedTodoIds] = useState<Set<string>>(() => new Set())
  const visibleTodos = todos.filter(todo => !deletedTodoIds.has(todo.id))

  if (visibleTodos.length === 0) {
    return <p className="text-gray-500 text-center py-4">No todos yet. Create your first todo!</p>
  }

  return (
    <div className="space-y-2">
      {visibleTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          appId={appId}
          onRefresh={onRefresh}
          onDeleted={(todoId) => {
            setDeletedTodoIds(current => new Set(current).add(todoId))
          }}
        />
      ))}
    </div>
  )
}
