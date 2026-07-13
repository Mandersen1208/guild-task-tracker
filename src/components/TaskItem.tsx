import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function getDueInfo(dueDate?: string) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Overdue', className: 'overdue-badge' };
  }
  if (diffDays === 0) {
    return { label: 'Today', className: 'today-badge' };
  }
  if (diffDays === 1) {
    return { label: 'Tomorrow', className: 'upcoming-badge' };
  }
  return { label: due.toLocaleDateString([], { month: 'short', day: 'numeric' }), className: 'upcoming-badge' };
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className={`task-row group flex items-center gap-3 px-4 py-3.5 ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="w-5 h-5 accent-[#F8B4C4] cursor-pointer"
      />
      <div className="flex-1 flex items-center gap-2">
        <span className={`text-[#5C4638] text-[15px] task-text ${task.completed ? 'line-through' : ''}`}>
          {task.text}
        </span>
        {task.isDaily && (
          <span className="daily-badge text-[10px]">daily</span>
        )}
        {(() => {
          const dueInfo = getDueInfo(task.dueDate);
          return dueInfo ? (
            <span className={`${dueInfo.className} text-[10px] ml-1`}>{dueInfo.label}</span>
          ) : null;
        })()}
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-[#F8B4C4] hover:text-[#E07A5F] text-xl transition-all leading-none pb-0.5"
      >
        ×
      </button>
    </div>
  );
}