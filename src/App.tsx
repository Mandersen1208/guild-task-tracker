import { useState, useEffect } from 'react';
import { useTasks } from './hooks/useTasks';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Clock from './components/Clock';

type Filter = 'all' | 'active' | 'completed';

export default function App() {
  const { tasks, isLoaded, addTask, toggleComplete, deleteTask, resetDailyTasks } = useTasks();
  const [filter, setFilter] = useState<Filter>('all');

  // Daily reset on mount
  useEffect(() => {
    if (isLoaded) {
      resetDailyTasks();
    }
  }, [isLoaded]);

  if (!isLoaded) return <div className="p-6">Loading...</div>;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="max-w-[440px] mx-auto p-6">
      <div className="kawaii-container p-8 relative">
        <div className="sparkles rounded-[24px]" />

        <div className="text-center mb-8 relative z-10">
          <div className="absolute top-0 right-0">
            <Clock />
          </div>
          <div className="kawaii-header text-3xl">my tasks ✨</div>
          <p className="text-[#B8A99A] text-sm mt-1">Resets at midnight</p>
        </div>

        <div className="relative z-10">
          <TaskInput onAdd={addTask} />

          <div className="flex gap-2 mb-6">
            <button onClick={() => setFilter('all')} className={`filter-pill flex-1 py-2.5 text-sm ${filter === 'all' ? 'active' : 'bg-white text-[#8C6F5C] hover:bg-[#FFF8F5]'}`}>All ({tasks.length})</button>
            <button onClick={() => setFilter('active')} className={`filter-pill flex-1 py-2.5 text-sm ${filter === 'active' ? 'active' : 'bg-white text-[#8C6F5C] hover:bg-[#FFF8F5]'}`}>Active ({activeCount})</button>
            <button onClick={() => setFilter('completed')} className={`filter-pill flex-1 py-2.5 text-sm ${filter === 'completed' ? 'active' : 'bg-white text-[#8C6F5C] hover:bg-[#FFF8F5]'}`}>Done ({completedCount})</button>
          </div>

          <TaskList tasks={filteredTasks} onToggle={toggleComplete} onDelete={deleteTask} />
        </div>
      </div>

      <div className="text-center mt-4 text-xs text-[#B8A99A]">
        made with care
      </div>
    </div>
  );
}