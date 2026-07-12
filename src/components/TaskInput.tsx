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
        placeholder="add something cute..."
        className="flex-1 px-5 py-3.5 bg-[#fff0f5] border-2 border-[#ffb6c1] rounded-3xl text-[#5c3d4d] placeholder:text-[#e8a0b0] focus:outline-none focus:border-[#ff69b4] text-sm"
      />
      <button
        onClick={handleSubmit}
        className="add-button px-7 py-3.5 text-white font-bold rounded-3xl text-sm active:scale-[0.985]"
      >
        Add ✨
      </button>
    </div>
  );
}