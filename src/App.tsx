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
      <div className="kawaii-container rounded-[26px] p-8 relative">
        
        <div className="sparkles rounded-[21px]" />

        <div className="text-center mb-8 relative z-10">
          <div className="kawaii-header font-semibold tracking-tight">
            my little tasks ✿
          </div>
          <p className="text-[#b89d82] text-sm mt-1">a tiny place for things that matter</p>
        </div>

        <div className="relative z-10">
          <TaskInput onAdd={addTask} />

          <div className="flex gap-2 mb-6">
            <button onClick={() => setFilter('all')} className={`filter-pill flex-1 py-2.5 text-sm rounded-3xl border ${filter === 'all' ? 'active' : 'bg-white text-[#8c6f5c] hover:bg-[#f9f5f0]'}`}>All ({tasks.length})</button>
            <button onClick={() => setFilter('active')} className={`filter-pill flex-1 py-2.5 text-sm rounded-3xl border ${filter === 'active' ? 'active' : 'bg-white text-[#8c6f5c] hover:bg-[#f9f5f0]'}`}>Active ({activeCount})</button>
            <button onClick={() => setFilter('completed')} className={`filter-pill flex-1 py-2.5 text-sm rounded-3xl border ${filter === 'completed' ? 'active' : 'bg-white text-[#8c6f5c] hover:bg-[#f9f5f0]'}`}>Done ({completedCount})</button>
          </div>

          <TaskList tasks={filteredTasks} onToggle={toggleComplete} onDelete={deleteTask} />
        </div>
      </div>

      <div className="text-center mt-4 text-xs text-[#b89d82] opacity-70">
        made with care in 1998 (kinda)
      </div>
    </div>
  );
}