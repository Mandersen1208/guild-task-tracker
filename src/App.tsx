import { useState, useEffect } from 'react';
import { useTasks } from './hooks/useTasks';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Clock from './components/Clock';

type Filter = 'all' | 'today' | 'upcoming';

export default function App() {
  const { tasks, isLoaded, addTask, toggleComplete, deleteTask, resetDailyTasks } = useTasks();

  // Persist filter for offline survival (minimal addition)
  const [filter, setFilter] = useState<Filter>(() => {
    try {
      const saved = localStorage.getItem('filter') as Filter | null;
      if (saved === 'all' || saved === 'today' || saved === 'upcoming') {
        return saved;
      }
    } catch {}
    return 'all';
  });

  // Save filter changes
  useEffect(() => {
    try {
      localStorage.setItem('filter', filter);
    } catch {}
  }, [filter]);

  // Daily reset on mount
  useEffect(() => {
    if (isLoaded) {
      resetDailyTasks();
    }
  }, [isLoaded]);

  // === Due date helpers (Guts Phase 1) ===
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const isOverdue = (task: any) => {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate < getTodayStr();
  };

  const isDueToday = (task: any) => {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate === getTodayStr();
  };

  const isUpcoming = (task: any) => {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate > getTodayStr();
  };

  // Launch summary banner state (dismiss per day)
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const today = getTodayStr();
      const dismissed = localStorage.getItem('bannerDismissedDate');
      if (dismissed !== today) {
        setShowBanner(true);
      }
    } catch {}
  }, [isLoaded]);

  const dismissBanner = () => {
    try {
      localStorage.setItem('bannerDismissedDate', getTodayStr());
    } catch {}
    setShowBanner(false);
    setBannerDismissed(true);
  };

  // === Notification Platform (Kisuke Urahara) ===
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [eodNotifiedToday, setEodNotifiedToday] = useState(false);

  // Sync permission state
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      return perm;
    } catch {
      return 'denied';
    }
  };

  // Gentle permission prompt UI state (shown once per day if not decided)
  const [showPermPrompt, setShowPermPrompt] = useState(false);

  useEffect(() => {
    if (!isLoaded || notificationPermission !== 'default') return;
    try {
      const today = getTodayStr();
      const lastPrompt = localStorage.getItem('lastPermPrompt');
      if (lastPrompt !== today) {
        // Show prompt after a short delay on first meaningful session
        const t = setTimeout(() => setShowPermPrompt(true), 1500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [isLoaded, notificationPermission]);

  const enableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setShowPermPrompt(false);
    try {
      localStorage.setItem('lastPermPrompt', getTodayStr());
    } catch {}
    if (perm === 'granted') {
      // Celebrate with a welcome notification
      showEodNotification('Notifications enabled ✨', 'You’ll get a gentle wrap-up reminder between 7-9pm.');
    }
  };

  const dismissPermPrompt = () => {
    setShowPermPrompt(false);
    try {
      localStorage.setItem('lastPermPrompt', getTodayStr());
    } catch {}
  };

  // Show notification preferring Service Worker for PWA reliability (esp. iPhone)
  const showEodNotification = (title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const options = {
      body,
      icon: '/guild-task-tracker/icon-192.jpg',
      tag: 'eod-reminder',
    };

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      // Use SW for better PWA support and click handling
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options,
      });
    } else {
      // Fallback to main thread
      new Notification(title, options);
    }
  };

  // === End-of-Day Notification Trigger ===
  useEffect(() => {
    if (!isLoaded) return;

    const checkEodNotification = () => {
      try {
        const now = new Date();
        const hour = now.getHours();
        const today = getTodayStr();
        const lastNotified = localStorage.getItem('lastEodNotified');

        // Trigger window: 7pm - 9pm local time
        if (hour >= 19 && hour < 21 && lastNotified !== today && !eodNotifiedToday) {
          const pending = tasks.filter(t => !t.completed && (t.dueDate || t.isDaily));
          if (pending.length > 0 && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              showEodNotification(
                'Kawaii Daily Wrap-up ✨',
                `Time to review your day. You have ${pending.length} task${pending.length > 1 ? 's' : ''} left. Great work today!`
              );
              localStorage.setItem('lastEodNotified', today);
              setEodNotifiedToday(true);
            } else if (Notification.permission === 'default' && !showPermPrompt) {
              // Proactively offer permission during EOD window
              setShowPermPrompt(true);
            }
          }
        }
      } catch {
        // notifications not supported or blocked - silent
      }
    };

    // Check immediately and every 2 minutes during EOD window
    checkEodNotification();
    const interval = setInterval(checkEodNotification, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded, tasks, eodNotifiedToday, showPermPrompt]);

  if (!isLoaded) return <div className="p-6">Loading...</div>;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'today') {
      return !task.completed && (isDueToday(task) || isOverdue(task));
    }
    if (filter === 'upcoming') {
      return !task.completed && isUpcoming(task);
    }
    return true; // all
  });

  const todayCount = tasks.filter(t => !t.completed && (isDueToday(t) || isOverdue(t))).length;
  const upcomingCount = tasks.filter(t => !t.completed && isUpcoming(t)).length;
  const totalCount = tasks.length;

  return (
    <div className="max-w-[440px] mx-auto p-6 app-shell">
      <div className="kawaii-container p-8 relative">
        <div className="sparkles rounded-[24px]" />

        <div className="mb-8 relative z-10">
          <div className="relative flex justify-center">
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Clock />
            </div>
            <div className="text-center">
              <div className="kawaii-header text-3xl">my tasks ✨</div>
              <p className="text-[#B8A99A] text-sm mt-1">Resets at midnight</p>
            </div>
          </div>
        </div>

        {/* Gentle Notification Permission Prompt (Kisuke platform) */}
        {showPermPrompt && notificationPermission === 'default' && (
          <div className="mb-6 p-4 bg-[#FFF0F5] border border-[#F8B4C4]/60 rounded-2xl text-center relative z-10">
            <div className="text-sm text-[#8C6F5C]">
              Enable gentle end-of-day reminders? <span className="text-xs">(7–9pm wrap-up)</span>
            </div>
            <div className="flex gap-2 mt-3 justify-center">
              <button
                onClick={enableNotifications}
                className="px-4 py-1.5 text-sm rounded-full bg-[#F8B4C4] text-white hover:bg-[#E89AB0] active:scale-[0.985] transition-all"
              >
                Enable ✨
              </button>
              <button
                onClick={dismissPermPrompt}
                className="px-4 py-1.5 text-sm rounded-full bg-white text-[#8C6F5C] border border-[#E8DFD5] hover:bg-[#FFF8F5]"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        <div className="relative z-10">
          <TaskInput onAdd={addTask} />

          <div className="flex gap-2 mb-6">
            <button onClick={() => setFilter('all')} className={`filter-pill flex-1 py-3 text-sm ${filter === 'all' ? 'active' : 'bg-white text-[#8C6F5C] hover:bg-[#FFF8F5]'}`}>All ({totalCount})</button>
            <button onClick={() => setFilter('today')} className={`filter-pill flex-1 py-3 text-sm ${filter === 'today' ? 'active' : 'bg-white text-[#8C6F5C] hover:bg-[#FFF8F5]'}`}>Today ({todayCount})</button>
            <button onClick={() => setFilter('upcoming')} className={`filter-pill flex-1 py-3 text-sm ${filter === 'upcoming' ? 'active' : 'bg-white text-[#8C6F5C] hover:bg-[#FFF8F5]'}`}>Upcoming ({upcomingCount})</button>
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