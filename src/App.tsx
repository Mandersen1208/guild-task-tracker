import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';

type Filter = 'all' | 'active' | 'completed';

export default function App() {
  const { tasks, isLoaded, addTask, toggleComplete, deleteTask } = useTasks();
  const [filter, setFilter] = useState<Filter>('all');

  if (!isLoaded) {
    return <div className="max-w-md mx-auto p-6">Loading...</div>;
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  const getFilterClass = (f: Filter) => {
    if (filter !== f) return 'filter-pill';
    if (f === 'all') return 'filter-pill active-all';
    if (f === 'active') return 'filter-pill active-active';
    return 'filter-pill active-completed';
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-8">
      {/* Expressive Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E07A5F] flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#3f2e2a] tracking-tight">Tasks</h1>
        </div>
        <p className="text-[#8a6f5c] text-sm">A little space for what matters</p>
      </div>

      <div className="task-card rounded-3xl shadow-sm border p-6">
        <TaskInput onAdd={addTask} />

        {/* Colorful Filter Pills */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-2xl border ${getFilterClass('all')}`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-2xl border ${getFilterClass('active')}`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-2xl border ${getFilterClass('completed')}`}
          >
            Done ({completedCount})
          </button>
        </div>

        <TaskList
          tasks={filteredTasks}
          onToggle={toggleComplete}
          onDelete={deleteTask}
        />
      </div>

      <div className="mt-6 text-center text-xs text-[#8a6f5c]">
        Saved in your browser
      </div>
    </div>
  );
}