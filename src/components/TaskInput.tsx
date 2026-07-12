import { useState, useRef } from 'react';

interface TaskInputProps {
  onAdd: (text: string) => void;
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="flex gap-2 mb-6">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="add something..."
        className="flex-1 px-5 py-3.5 bg-[#f9f5f0] border-2 border-[#e8d9c9] rounded-3xl text-[#5c4638] placeholder:text-[#c9b29f] focus:outline-none focus:border-[#d4b89e] text-sm"
      />
      <button
        onClick={handleSubmit}
        className="add-button px-7 py-3.5 rounded-3xl text-sm font-medium active:scale-[0.985]"
      >
        Add
      </button>
    </div>
  );
}