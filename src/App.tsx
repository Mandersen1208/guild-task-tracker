import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';

type Filter = 'all' | 'active' | 'completed';

export default function App() {
  const { tasks, isLoaded, addTask, toggleComplete, deleteTask } = useTasks();
  const [filter, setFilter] = useState<Filter>('all');

  if (!isLoaded) return <div className="p-6">Loading...</div>;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="max-w-[460px] mx-auto p-6">
      <div className="kawaii-container rounded-[28px] p-8 relative">
        
        {/* Sparkle Background */}
        <div className="sparkles rounded-[22px]" />

        {/* Rainbow Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="kawaii-header font-black tracking-[-1.5px]">
            ✿ my little tasks ✿
          </div>
          <p className="text-[#ff69b4] text-sm mt-1">a tiny place for things that matter~</p>
        </div>

        <div className="relative z-10">
          <TaskInput onAdd={addTask} />

          {/* Pastel Filter Pills */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setFilter('all')} className={`filter-pill flex-1 py-2.5 text-sm rounded-3xl border-2 border-[#ffb6c1] ${filter === 'all' ? 'active bg-[#ff69b4] text-white border-[#ff69b4]' : 'bg-white text-[#ff69b4] hover:bg-[#fff0f5]'}`}>All ({tasks.length})</button>
            <button onClick={() => setFilter('active')} className={`filter-pill flex-1 py-2.5 text-sm rounded-3xl border-2 border-[#98fb98] ${filter === 'active' ? 'active bg-[#98fb98] text-white border-[#98fb98]' : 'bg-white text-[#98fb98] hover:bg-[#f0fff0]'}`}>Active ({activeCount})</button>
            <button onClick={() => setFilter('completed')} className={`filter-pill flex-1 py-2.5 text-sm rounded-3xl border-2 border-[#dda0dd] ${filter === 'completed' ? 'active bg-[#dda0dd] text-white border-[#dda0dd]' : 'bg-white text-[#dda0dd] hover:bg-[#faf0ff]'}`}>Done ({completedCount})</button>
          </div>

          <TaskList tasks={filteredTasks} onToggle={toggleComplete} onDelete={deleteTask} />
        </div>
      </div>

      <div className="text-center mt-4 text-xs text-[#ff69b4] opacity-70">
        made with ✨ in 1998 (kinda)
      </div>
    </div>
  );
}