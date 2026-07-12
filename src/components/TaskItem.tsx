import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className={`task-row group flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="w-5 h-5 accent-[#ff69b4] cursor-pointer"
      />
      <span className={`flex-1 text-[#5c3d4d] text-[15px] ${task.completed ? 'line-through opacity-60' : ''}`}>
        {task.text}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-[#ffb6c1] hover:text-[#ff69b4] text-xl transition-all leading-none pb-0.5"
      >
        ×
      </button>
    </div>
  );
}