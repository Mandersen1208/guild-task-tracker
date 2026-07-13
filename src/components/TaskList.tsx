import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function EmptyState() {
  return (
    <div className="empty-state" role="status">
      <div className="empty-orb" aria-hidden="true">🌸</div>
      <p>nothing here yet.</p>
      <span>add a tiny quest when you feel ready.</span>
    </div>
  );
}

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) return <EmptyState />;

  return (
    <div className="task-list" aria-label="Tasks">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}
