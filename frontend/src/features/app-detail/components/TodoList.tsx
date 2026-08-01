import { TodoItem } from './TodoItem'

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
  appId: string
  parentId?: string | null
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
  if (todos.length === 0) {
    return <p className="text-gray-500 text-center py-4">No todos yet. Create your first todo!</p>
  }

  const renderBranch = (parentId: string | null, depth: number): React.ReactNode =>
    todos
      .filter(todo => (todo.parentId ?? null) === parentId)
      .map(todo => (
        <div key={todo.id} style={{ marginLeft: `${depth * 1.5}rem` }}>
          <TodoItem todo={todo} appId={appId} onRefresh={onRefresh} />
          {renderBranch(todo.id, depth + 1)}
        </div>
      ))

  return <div className="space-y-2">{renderBranch(null, 0)}</div>
}
