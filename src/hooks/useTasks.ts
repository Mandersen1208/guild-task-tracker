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
        if (Array.isArray(parsed)) {
          // safe parse + basic validation + migration for isDaily
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
    try {
      const today = new Date().toISOString().split('T')[0];
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