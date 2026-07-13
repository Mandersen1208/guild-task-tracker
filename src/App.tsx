import { useState, useEffect } from 'react';
import { useTasks } from './hooks/useTasks';
import { Task } from './types';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Clock from './components/Clock';

type Filter = 'all' | 'today' | 'upcoming';
type ReminderSettingKey = 'taskRemindersEnabled' | 'eodRemindersEnabled';

type ReminderSettings = {
  taskRemindersEnabled: boolean;
  eodRemindersEnabled: boolean;
};

const FILTER_KEY = 'filter';
const REMINDER_SETTINGS_KEY = 'reminderSettings';
const LAST_EOD_NOTIFIED_KEY = 'lastEodNotified';
const TASK_REMINDER_NOTIFIED_KEY = 'taskReminderNotified';

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  taskRemindersEnabled: true,
  eodRemindersEnabled: true,
};

function getLocalDateStr(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTaskReminderKey(task: Task) {
  if (!task.dueDate || !task.dueTime) return null;
  return `${task.dueDate}T${task.dueTime}`;
}

function getTaskDueAt(task: Task) {
  if (!task.dueDate || !task.dueTime) return null;
  const dueAt = new Date(`${task.dueDate}T${task.dueTime}:00`);
  return Number.isNaN(dueAt.getTime()) ? null : dueAt;
}

function readTaskReminderLog(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TASK_REMINDER_NOTIFIED_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function formatDueTime(time?: string) {
  if (!time) return '';
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;

  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object') {
      return {
        taskRemindersEnabled: typeof parsed.taskRemindersEnabled === 'boolean'
          ? parsed.taskRemindersEnabled
          : DEFAULT_REMINDER_SETTINGS.taskRemindersEnabled,
        eodRemindersEnabled: typeof parsed.eodRemindersEnabled === 'boolean'
          ? parsed.eodRemindersEnabled
          : DEFAULT_REMINDER_SETTINGS.eodRemindersEnabled,
      };
    }
  } catch {}

  return DEFAULT_REMINDER_SETTINGS;
}

export default function App() {
  const { tasks, isLoaded, addTask, toggleComplete, deleteTask, resetDailyTasks } = useTasks();

  // Persist filter for offline survival (minimal addition)
  const [filter, setFilter] = useState<Filter>(() => {
    try {
      const saved = localStorage.getItem(FILTER_KEY) as Filter | null;
      if (saved === 'all' || saved === 'today' || saved === 'upcoming') {
        return saved;
      }
    } catch {}
    return 'all';
  });

  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(loadReminderSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Save filter changes
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_KEY, filter);
    } catch {}
  }, [filter]);

  // Save reminder setting changes
  useEffect(() => {
    try {
      localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(reminderSettings));
    } catch {}
  }, [reminderSettings]);

  // Daily reset on mount
  useEffect(() => {
    if (isLoaded) {
      resetDailyTasks();
    }
  }, [isLoaded]);

  // === Due date helpers (Guts Phase 1) ===
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate < getLocalDateStr();
  };

  const isDueToday = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate === getLocalDateStr();
  };

  const isUpcoming = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate > getLocalDateStr();
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

  const showAppNotification = (title: string, body: string, tag: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const options = {
      body,
      icon: '/guild-task-tracker/icon-192.jpg',
      tag,
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

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        showAppNotification('Notifications enabled ✨', 'Task reminders and daily wrap-ups are ready when enabled.', 'notifications-enabled');
      }
      return perm;
    } catch {
      return 'denied';
    }
  };

  const updateReminderSetting = async (key: ReminderSettingKey, enabled: boolean) => {
    setReminderSettings(current => ({ ...current, [key]: enabled }));

    if (enabled && notificationPermission === 'default') {
      await requestNotificationPermission();
    }
  };

  // === Task Due Date + Time Notification Trigger ===
  useEffect(() => {
    if (!isLoaded || !reminderSettings.taskRemindersEnabled) return;

    const checkTaskReminders = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      try {
        const now = new Date();
        const notified = readTaskReminderLog();
        const nextNotified: Record<string, string> = {};
        let changed = false;

        tasks.forEach(task => {
          const reminderKey = getTaskReminderKey(task);
          if (!reminderKey || task.completed) return;

          const dueAt = getTaskDueAt(task);
          if (!dueAt) return;

          // Preserve current reminder keys for active due-date/time tasks.
          if (notified[task.id] === reminderKey) {
            nextNotified[task.id] = reminderKey;
            return;
          }

          const msPastDue = now.getTime() - dueAt.getTime();
          const withinGraceWindow = msPastDue >= 0 && msPastDue <= 5 * 60 * 1000;

          if (withinGraceWindow) {
            const timeLabel = formatDueTime(task.dueTime);
            showAppNotification(
              'Task reminder ✨',
              `${task.text}${timeLabel ? ` was due at ${timeLabel}` : ' is due now'}.`,
              `task-reminder-${task.id}`
            );
            nextNotified[task.id] = reminderKey;
            changed = true;
          }
        });

        Object.entries(notified).forEach(([taskId, reminderKey]) => {
          const task = tasks.find(t => t.id === taskId);
          if (task && getTaskReminderKey(task) === reminderKey) {
            nextNotified[taskId] = reminderKey;
          } else {
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem(TASK_REMINDER_NOTIFIED_KEY, JSON.stringify(nextNotified));
        }
      } catch {
        // notifications not supported or storage unavailable - silent for MVP
      }
    };

    checkTaskReminders();
    const interval = setInterval(checkTaskReminders, 30 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded, tasks, reminderSettings.taskRemindersEnabled, notificationPermission]);

  // === End-of-Day Notification Trigger ===
  useEffect(() => {
    if (!isLoaded || !reminderSettings.eodRemindersEnabled) return;

    const checkEodNotification = () => {
      try {
        const now = new Date();
        const hour = now.getHours();
        const today = getLocalDateStr();
        const lastNotified = localStorage.getItem(LAST_EOD_NOTIFIED_KEY);

        // Trigger window: 7pm - 9pm local time
        if (hour >= 19 && hour < 21 && lastNotified !== today && !eodNotifiedToday) {
          const pending = tasks.filter(t => !t.completed && (t.dueDate || t.isDaily));
          if (pending.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
            showAppNotification(
              'Kawaii Daily Wrap-up ✨',
              `Time to review your day. You have ${pending.length} task${pending.length > 1 ? 's' : ''} left. Great work today!`,
              'eod-reminder'
            );
            localStorage.setItem(LAST_EOD_NOTIFIED_KEY, today);
            setEodNotifiedToday(true);
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
  }, [isLoaded, tasks, eodNotifiedToday, reminderSettings.eodRemindersEnabled]);

  if (!isLoaded) return <div className="app-loading app-shell">Loading your quests...</div>;

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

  const permissionText = !('Notification' in window)
    ? 'Browser notifications are not supported here.'
    : notificationPermission === 'granted'
      ? 'Browser notifications are allowed.'
      : notificationPermission === 'denied'
        ? 'Browser notifications are blocked in browser settings.'
        : 'Browser permission is needed before reminders can appear.';

  const activeReminderCount = Number(reminderSettings.taskRemindersEnabled) + Number(reminderSettings.eodRemindersEnabled);

  return (
    <main className="app-shell">
      <section className="kawaii-container" aria-label="Guild task tracker">
        <div className="sparkles" />

        <header className="app-header">
          <div>
            <p className="header-kicker">🌸 gentle guild board</p>
            <h1 className="kawaii-header">my tasks</h1>
            <p className="header-copy">Daily tasks reset when you return each day.</p>
          </div>
          <Clock />
        </header>

        <div className="panel-stack">
          <section className="settings-section" aria-label="Reminder settings">
            <button
              onClick={() => setSettingsOpen(open => !open)}
              className="settings-button"
              aria-expanded={settingsOpen}
            >
              <span>
                <span className="settings-title">Reminder settings</span>
                <span className="settings-subtitle">{activeReminderCount}/2 gentle nudges active</span>
              </span>
              <span className="settings-chevron" aria-hidden="true">{settingsOpen ? '⌃' : '⌄'}</span>
            </button>

            {settingsOpen && (
              <div className="settings-panel">
                <div className="settings-panel-header">
                  <span aria-hidden="true">🔔</span>
                  <div>
                    <h2>Reminder garden</h2>
                    <p>Choose which notifications are allowed to bloom.</p>
                  </div>
                </div>

                <div className="setting-list">
                  <label className="setting-row">
                    <span className="setting-copy">
                      <span className="setting-name">Task due date + time reminders</span>
                      <span className="setting-note">Fires once when an incomplete task has both a due date and time.</span>
                    </span>
                    <span className="setting-toggle">
                      <input
                        type="checkbox"
                        checked={reminderSettings.taskRemindersEnabled}
                        onChange={(e) => updateReminderSetting('taskRemindersEnabled', e.target.checked)}
                        className="sr-only"
                      />
                      <span className="toggle-track" aria-hidden="true"><span className="toggle-dot" /></span>
                    </span>
                  </label>

                  <label className="setting-row">
                    <span className="setting-copy">
                      <span className="setting-name">End-of-day wrap-up reminders</span>
                      <span className="setting-note">Keeps the existing 7–9pm gentle review reminder.</span>
                    </span>
                    <span className="setting-toggle">
                      <input
                        type="checkbox"
                        checked={reminderSettings.eodRemindersEnabled}
                        onChange={(e) => updateReminderSetting('eodRemindersEnabled', e.target.checked)}
                        className="sr-only"
                      />
                      <span className="toggle-track" aria-hidden="true"><span className="toggle-dot" /></span>
                    </span>
                  </label>
                </div>

                <div className="permission-card">
                  <p>{permissionText}</p>
                  {notificationPermission === 'default' && 'Notification' in window && (
                    <button
                      onClick={requestNotificationPermission}
                      className="permission-button"
                      type="button"
                    >
                      Allow browser notifications ✨
                    </button>
                  )}
                  <span>Reminders are best-effort while the app/PWA is open or active.</span>
                </div>
              </div>
            )}
          </section>

          <TaskInput onAdd={addTask} />

          <nav className="filter-bar" aria-label="Task filters">
            <button onClick={() => setFilter('all')} aria-pressed={filter === 'all'} className={`filter-pill ${filter === 'all' ? 'active' : ''}`}>All <span>{totalCount}</span></button>
            <button onClick={() => setFilter('today')} aria-pressed={filter === 'today'} className={`filter-pill ${filter === 'today' ? 'active' : ''}`}>Today <span>{todayCount}</span></button>
            <button onClick={() => setFilter('upcoming')} aria-pressed={filter === 'upcoming'} className={`filter-pill ${filter === 'upcoming' ? 'active' : ''}`}>Upcoming <span>{upcomingCount}</span></button>
          </nav>

          <TaskList tasks={filteredTasks} onToggle={toggleComplete} onDelete={deleteTask} />
        </div>
      </section>

      <p className="made-with-care">made with care · tiny steps count</p>
    </main>
  );
}
