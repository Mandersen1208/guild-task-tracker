export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isDaily?: boolean;
}