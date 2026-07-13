import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatTime(time?: string) {
  if (!time) return '';
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;

  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getDueInfo(dueDate?: string, dueTime?: string) {
  const timeLabel = formatTime(dueTime);

  if (!dueDate) {
    return timeLabel ? { label: `Time ${timeLabel}`, className: 'badge-upcoming' } : null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const suffix = timeLabel ? ` · ${timeLabel}` : '';

  if (diffDays < 0) {
    return { label: `Overdue${suffix}`, className: 'badge-overdue' };
  }
  if (diffDays === 0) {
    return { label: `Today${suffix}`, className: 'badge-today' };
  }
  if (diffDays === 1) {
    return { label: `Tomorrow${suffix}`, className: 'badge-upcoming' };
  }
  return { label: `${due.toLocaleDateString([], { month: 'short', day: 'numeric' })}${suffix}`, className: 'badge-upcoming' };
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const dueInfo = getDueInfo(task.dueDate, task.dueTime);

  return (
    <article className={`task-row ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
        className="task-check"
      />

      <div className="task-content">
        <span className="task-text">{task.text}</span>
        {(task.isDaily || dueInfo) && (
          <div className="task-meta" aria-label="Task details">
            {task.isDaily && <span className="badge badge-daily">daily</span>}
            {dueInfo && <span className={`badge ${dueInfo.className}`}>{dueInfo.label}</span>}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="delete-task-button"
        aria-label={`Delete ${task.text}`}
        type="button"
      >
        ×
      </button>
    </article>
  );
}
