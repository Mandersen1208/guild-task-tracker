export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isDaily?: boolean;
  dueDate?: string; // YYYY-MM-DD format for local due dates
}