import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
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