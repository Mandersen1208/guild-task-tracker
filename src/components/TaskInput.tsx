import { useState, useRef } from 'react';

interface TaskInputProps {
  onAdd: (text: string, isDaily?: boolean, dueDate?: string, dueTime?: string) => void;
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed, isDaily, dueDate || undefined, dueTime || undefined);
      setValue('');
      setIsDaily(false);
      setDueDate('');
      setDueTime('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="add something..."
          aria-label="Task text"
          className="task-input flex-1 px-5 py-3.5 text-[#5C4638] placeholder:text-[#C9B29F] text-sm w-full"
        />
        <button onClick={handleSubmit} className="add-button px-6 py-3.5 text-sm w-full sm:w-auto">
          Add
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-[#8C6F5C]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDaily}
            onChange={(e) => setIsDaily(e.target.checked)}
            className="accent-[#F8B4C4]"
          />
          <span>Daily task (resets every day)</span>
        </label>

        <label className="flex items-center gap-1.5">
          <span className="text-[#8C6F5C]">Due date:</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-xs px-2 py-1 rounded border border-[#F8B4C4]/40 bg-white text-[#5C4638] focus:outline-none focus:border-[#F8B4C4]"
          />
        </label>

        <label className="flex items-center gap-1.5">
          <span className="text-[#8C6F5C]">Time:</span>
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="text-xs px-2 py-1 rounded border border-[#F8B4C4]/40 bg-white text-[#5C4638] focus:outline-none focus:border-[#F8B4C4]"
          />
        </label>

        {(dueDate || dueTime) && (
          <button
            onClick={() => {
              setDueDate('');
              setDueTime('');
            }}
            className="text-[#E07A5F] hover:text-[#C45D4A] text-xs leading-none underline decoration-dotted"
            aria-label="Clear due date and time"
          >
            clear due
          </button>
        )}
      </div>
    </div>
  );
}
