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
    <section className="task-composer" aria-label="Add a new task">
      <div className="composer-label">
        <span>New quest</span>
        <span className="composer-hint">due date + time optional</span>
      </div>

      <div className="task-input-row">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="write a tiny quest..."
          aria-label="Task text"
          className="task-input"
        />
        <button onClick={handleSubmit} className="add-button" type="button">
          Add ✨
        </button>
      </div>

      <div className="task-options-grid">
        <label className="option-chip daily-option">
          <input
            type="checkbox"
            checked={isDaily}
            onChange={(e) => setIsDaily(e.target.checked)}
            className="accent-[#F8B4C4]"
          />
          <span>Daily reset</span>
        </label>

        <label className="mini-field">
          <span>Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>

        <label className="mini-field">
          <span>Due time</span>
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </label>

        {(dueDate || dueTime) && (
          <button
            onClick={() => {
              setDueDate('');
              setDueTime('');
            }}
            className="clear-due-button"
            aria-label="Clear due date and time"
            type="button"
          >
            clear due
          </button>
        )}
      </div>
    </section>
  );
}
