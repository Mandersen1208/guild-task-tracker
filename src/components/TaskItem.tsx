import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className={`task-row group flex items-center gap-3 px-4 py-3.5 rounded-2xl ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="w-5 h-5 accent-[#d4b89e] cursor-pointer"
      />
      <span className={`flex-1 text-[#5c4638] text-[15px] ${task.completed ? 'line-through' : ''}`}>
        {task.text}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-[#d4b89e] hover:text-[#b89d82] text-xl transition-all leading-none pb-0.5"
      >
        ×
      </button>
    </div>
  );
}