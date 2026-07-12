import { useState, useEffect } from 'react';
import { Task } from '../types';

const STORAGE_KEY = 'tasks';
const LAST_RESET_KEY = 'lastResetDate';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  const save = (newTasks: Task[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  const addTask = (text: string, isDaily: boolean = false) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      isDaily,
    };
    save([...tasks, newTask]);
  };

  const toggleComplete = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    save(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    save(updated);
  };

  // Daily reset logic (Shiroe)
  const resetDailyTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem(LAST_RESET_KEY);

    if (lastReset !== today) {
      const updated = tasks.map(t =>
        t.isDaily ? { ...t, completed: false } : t
      );
      save(updated);
      localStorage.setItem(LAST_RESET_KEY, today);
    }
  };

  return {
    tasks,
    isLoaded,
    addTask,
    toggleComplete,
    deleteTask,
    resetDailyTasks,
  };
}