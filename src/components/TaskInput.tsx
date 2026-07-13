import { useState, useRef } from 'react';

interface TaskInputProps {
  onAdd: (text: string, isDaily?: boolean) => void;
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed, isDaily);
      setValue('');
      setIsDaily(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="add something..."
          className="task-input flex-1 px-5 py-3.5 text-[#5C4638] placeholder:text-[#C9B29F] text-sm"
        />
        <button onClick={handleSubmit} className="add-button px-6 py-3.5 text-sm">
          Add
        </button>
      </div>

      <label className="flex items-center gap-2 mt-2 text-xs text-[#8C6F5C] cursor-pointer">
        <input
          type="checkbox"
          checked={isDaily}
          onChange={(e) => setIsDaily(e.target.checked)}
          className="accent-[#F8B4C4]"
        />
        <span>Daily task (resets every day)</span>
      </label>
    </div>
  );
}
