/**
 * Todo entity representing a single todo item.
 */
export type TodoEntity = {
  id: string;
  appId: string;
  parentId?: string | null;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
