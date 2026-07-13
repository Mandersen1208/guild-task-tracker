import { useState, useEffect } from 'react';
import { Task } from '../types';

const STORAGE_KEY = 'tasks';
const LAST_RESET_KEY = 'lastResetDate';
const DUE_TIME_PATTERN = /^\d{2}:\d{2}$/;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // safe parse + basic validation + migration for optional fields
          const validated = parsed
            .filter((t: any): t is Task =>
              t &&
              typeof t.id === 'string' &&
              typeof t.text === 'string' &&
              typeof t.completed === 'boolean'
            )
            .map((t: any) => ({
              id: t.id,
              text: t.text,
              completed: t.completed,
              isDaily: Boolean(t.isDaily),
              dueDate: typeof t.dueDate === 'string' ? t.dueDate : undefined,
              dueTime: typeof t.dueTime === 'string' && DUE_TIME_PATTERN.test(t.dueTime) ? t.dueTime : undefined,
            }));
          setTasks(validated);
        }
      }
    } catch {
      // corrupted data or private mode: start fresh (silent for MVP)
    }
    setIsLoaded(true);
  }, []);

  const save = (newTasks: Task[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch {
      // storage full / private / quota: UI still works, data lost on reload
    }
    setTasks(newTasks);
  };

  const addTask = (text: string, isDaily: boolean = false, dueDate?: string, dueTime?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      isDaily,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
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
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const lastReset = localStorage.getItem(LAST_RESET_KEY);

      if (lastReset !== today) {
        const updated = tasks.map(t =>
          t.isDaily ? { ...t, completed: false } : t
        );
        save(updated);
        localStorage.setItem(LAST_RESET_KEY, today);
      }
    } catch {
      // ignore reset errors (non-critical)
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
