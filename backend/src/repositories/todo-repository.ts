import type { TodoEntity } from '../models/todo';

/**
 * Interface for todo persistence operations.
 */
export interface TodoRepository {
  save(todo: TodoEntity): Promise<void>;
  listActiveByAppId(appId: string): Promise<TodoEntity[]>;
  findActiveById(appId: string, todoId: string): Promise<TodoEntity | null>;
}
