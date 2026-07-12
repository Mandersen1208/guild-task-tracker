import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function EmptyState() {
  return (
    <div className="empty-state flex flex-col items-center justify-center py-14 text-center">
      <div className="text-5xl mb-3 opacity-70">🌿</div>
      <p className="text-[#b89d82] text-sm">nothing here yet.<br />add something when you feel like it.</p>
    </div>
  );
}

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) return <EmptyState />;

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}