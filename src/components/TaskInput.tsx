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

  const isDisabled = !value.trim();

  return (
    <div className="flex gap-2 mb-6">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        className="flex-1 px-4 py-3 bg-[#fdf6f0] border border-[#f3e8d8] rounded-2xl text-[#3f2e2a] placeholder:text-[#b89d8a] focus:outline-none focus:border-[#E07A5F] transition-colors"
      />
      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        className="add-button px-6 py-3 text-white rounded-2xl font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Add
      </button>
    </div>
  );
}