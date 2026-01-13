/**
 * StudyHub - Main Application Component
 * 
 * Enterprise-grade dashboard with:
 * - Zustand state management
 * - Modern hooks patterns
 * - Premium UI with Framer Motion
 * - Keyboard shortcuts
 * - Responsive design
 */

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { format } from 'date-fns';

// Components (Eagerly loaded - always needed)
import AppCard, { AddAppCard } from './components/AppCard';
import Sidebar from './components/Sidebar';
import Dock from './components/navigation/Dock';
import PomodoroTimer from './components/tools/PomodoroTimer';
import TodoList from './components/tools/TodoList';
import SessionHistory from './components/tools/SessionHistory';
import { Spinner } from './components/ui/Loading';
import CommandPalette from './components/ui/CommandPalette';
import {
  PageLoadingSkeleton,
  ChatLoadingSkeleton,
  CityBuilderLoadingSkeleton
} from './components/ui/LazyLoadingFallbacks';

// Lazy loaded components (Code splitting for performance)
const CityBuilder = React.lazy(() => import('./components/tools/CityBuilder'));
const ProgressSection = React.lazy(() => import('./components/tools/ProgressSection'));
const ResourceCanvas = React.lazy(() => import('./components/resources/ResourceCanvas'));
const AIChat = React.lazy(() => import('./components/tools/AIChat'));

const AdminPanel = React.lazy(() => import('./components/tools/AdminPanel'));
import AddAppModal from './components/AddAppModal';
import { useCustomApps } from './hooks/useCustomApps';

// Widgets
import { StreakHeatmap, BentoDashboard } from './components/widgets';

// Lumina OS Components
import { LuminaOverview } from './components/lumina';

// Store & Hooks
import { useAppStore, useSessionStore, useTaskStore } from './store';
import { useHotkey, useOnlineStatus, useDebounce } from './hooks';
import { useToast } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import PasswordModal from './components/PasswordModal';

// Utils
import { cn, getGreeting } from './lib/utils';
import { getBuildingConfig } from './utils/pomodoroConfig';
import { useSoundManager } from './utils/soundManager';
import { useNotifications } from './utils/notificationService';
import appsData from './apps.json';

// Icons
import {
  Search,
  Bell,
  Command,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Flame,
  Calendar,
  ArrowRight,
  Clock
} from 'lucide-react';

// =============================================================================
// Motivational Quotes
// =============================================================================

const MOTIVATIONAL_QUOTES = [
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
];

// =============================================================================
// Page Transition Variants
// =============================================================================

// Simplified variants to ensure position: sticky works
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut',
};

// =============================================================================
// Stats Card Component with Animated Counter
// =============================================================================

const StatsCard = ({ icon: Icon, label, value, subtext, gradient, delay = 0 }) => {
  const cardRef = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 400, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 400, damping: 25 });

  const handleMouseMove = React.useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);
    rotateX.set(-mouseY * 8);
    rotateY.set(mouseX * 8);
  }, [rotateX, rotateY]);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  // Extract numeric value for animation
  const numericValue = parseFloat(value) || 0;
  const suffix = String(value).replace(/[\d.,]/g, '').trim();

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative overflow-hidden',
        'p-6 rounded-3xl',
        'border border-white/10',
        gradient,
        'shadow-lg cursor-pointer'
      )}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"
        animate={{
          scale: isHovered ? 1.5 : 1,
          opacity: isHovered ? 0.2 : 0.1,
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
            transition={{ duration: 0.4 }}
          >
            <Icon size={18} className="text-white/80" />
          </motion.div>
          <span className="text-sm font-medium text-white/80">{label}</span>
        </div>
        <motion.p
          className="text-3xl font-black text-white mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatedNumber value={numericValue} suffix={suffix} />
        </motion.p>
        <p className="text-xs text-white/60">{subtext}</p>
      </div>
    </motion.div>
  );
};

// Animated Number Component (inline for simplicity)
const AnimatedNumber = ({ value, suffix = '' }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 20, duration: 1.5 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  React.useEffect(() => {
    return springValue.on('change', (v) => setDisplay(Math.round(v)));
  }, [springValue]);

  return <>{display.toLocaleString()}{suffix}</>;
};

// =============================================================================
// Main App Component
// =============================================================================

function App() {
  const toast = useToast();
  const isOnline = useOnlineStatus();

  // Zustand stores
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  // Session store
  const sessions = useSessionStore((s) => s.sessions);
  const setSessions = useSessionStore((s) => s.setSessions);
  const timerState = useSessionStore((s) => s.timerState);
  const setTimerState = useSessionStore((s) => s.setTimerState);

  // Task store
  const tasks = useTaskStore((s) => s.tasks);
  const setTasks = useTaskStore((s) => s.setTasks);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const removeTask = useTaskStore((s) => s.removeTask);
  const markTaskSaved = useTaskStore((s) => s.markTaskSaved);

  // Sound and notification hooks
  const soundManager = useSoundManager();
  const notifications = useNotifications();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);

  // Custom apps hook
  const { customApps, addApp: addCustomApp, updateApp, removeApp } = useCustomApps();
  const [editingApp, setEditingApp] = useState(null);
  const [dailyQuote] = useState(() =>
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  // Handler for saving (add or edit) custom app
  const handleSaveApp = useCallback((appData, isEdit) => {
    const isExistingCustomApp = customApps.some(a => a.id === appData.id);

    // If it's an edit of a CUSTOM app, update it.
    // If it's an "edit" of a SYSTEM app, we technically "Add" it as a new custom app (Shadowing).
    // If it's a completely new app, we Add it.
    if (isEdit && isExistingCustomApp) {
      updateApp(appData.id, appData);
    } else {
      // Create/Shadow
      addApp(appData);
    }
    setEditingApp(null);
  }, [addCustomApp, updateApp, customApps]);

  // Handler for editing a custom app
  const handleEditApp = useCallback((app) => {
    setEditingApp(app);
    setIsAddAppModalOpen(true);
  }, []);

  // Handler for deleting a custom app
  const handleDeleteApp = useCallback((app) => {
    if (window.confirm(`Are you sure you want to delete "${app.name}"?`)) {
      removeApp(app.id);
    }
  }, [removeApp]);

  const debouncedSearch = useDebounce(searchTerm, 200);

  // Command Palette keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Combine static apps with custom apps, with Custom Apps "Shadowing" system apps
  const filteredApps = useMemo(() => {
    // Create a map of all apps, favoring custom apps (overrides)
    const appMap = new Map();

    // 1. Add all system apps first
    appsData.forEach(app => appMap.set(app.id, { ...app, isSystem: true }));

    // 2. Add/Overwrite with custom apps
    customApps.forEach(app => appMap.set(app.id, { ...app, isCustom: true }));

    const allApps = Array.from(appMap.values());

    if (!debouncedSearch) return allApps;
    const query = debouncedSearch.toLowerCase();
    return allApps.filter(app =>
      app.name.toLowerCase().includes(query) ||
      (app.description && app.description.toLowerCase().includes(query))
    );
  }, [debouncedSearch, customApps]);

  // Keyboard shortcuts
  useHotkey('ctrl+k', () => {
    // TODO: Open command palette
    toast.info('Command Palette', 'Coming soon! Press Ctrl+K to quick navigate.');
  });

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Load sessions from API
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch('/api/sessions');
        if (response.ok) {
          const data = await response.json();
          // Validate data is an array before setting
          setSessions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem('pomodoro_history');
          if (saved) setSessions(JSON.parse(saved));
        } catch (_parseError) {
          // localStorage parse failed, ignore
        }
      } finally {
        setIsLoadingSessions(false);
      }
    };
    loadSessions();
  }, [setSessions]);

  // Load active timer from server (cross-device persistence) - runs ONCE on mount
  const hasLoadedActiveTimer = React.useRef(false);
  useEffect(() => {
    if (hasLoadedActiveTimer.current) return;
    hasLoadedActiveTimer.current = true;

    const loadActiveTimer = async () => {
      try {
        const response = await fetch('/api/active-timer');
        if (!response.ok) return;
        const data = await response.json();

        if (data.status === 'active' && data.startTime && data.durationSeconds) {
          const elapsed = Math.floor((Date.now() - Number(data.startTime)) / 1000);
          const remaining = data.durationSeconds - elapsed;

          if (remaining > 0) {
            // Resume timer - store startTime for continuous sync
            setTimerState({
              duration: Math.floor(data.durationSeconds / 60),
              timeLeft: remaining,
              initialTime: data.durationSeconds,
              startTime: Number(data.startTime),
              isActive: true,
              isCompleted: false,
              isFailed: false,
            });
            toast.info('Timer Resumed', `Resuming with ${Math.floor(remaining / 60)}m ${remaining % 60}s left`);
          } else {
            // Timer completed while away - trigger completion
            const minutes = Math.floor(data.durationSeconds / 60);
            const building = getBuildingConfig(minutes);

            setTimerState({
              duration: minutes,
              timeLeft: 0,
              initialTime: data.durationSeconds,
              isActive: false,
              isCompleted: true,
              isFailed: false,
            });

            // Save completed session
            const newSession = {
              id: String(Date.now()),
              type: building.id,
              minutes,
              elapsedSeconds: data.durationSeconds,
              timestamp: new Date(),
              status: 'completed',
            };
            setSessions(prev => [...prev, newSession]);

            fetch('/api/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newSession),
            }).catch(err => console.error('Failed to save session:', err));

            // Clear active timer from server
            fetch('/api/active-timer', { method: 'DELETE' }).catch(() => { });

            soundManager.playComplete();
            notifications.timerComplete(minutes);
            toast.success('Focus Complete!', `Session completed while you were away!`);
          }
        } else if (data.status === 'paused' && data.pausedRemaining) {
          // Restore paused state
          const durationMins = Math.floor(data.durationSeconds / 60);
          setTimerState({
            duration: durationMins,
            timeLeft: data.pausedRemaining,
            initialTime: data.durationSeconds,
            isActive: false,
            isCompleted: false,
            isFailed: false,
          });
        }
      } catch (error) {
        console.error('Failed to load active timer:', error);
      }
    };
    loadActiveTimer();
  }, []); // Empty deps - run once on mount

  // Load tasks from API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch('/api/todos');
        if (response.ok) {
          const data = await response.json();
          setTasks(data.map(t => ({ ...t, isSaved: true })));
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    loadTasks();
  }, [setTasks]);

  // Timer logic - calculate remaining from startTime for cross-browser sync
  useEffect(() => {
    if (!timerState.isActive || !timerState.startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      const remaining = timerState.initialTime - elapsed;

      if (remaining > 0) {
        setTimerState({ timeLeft: remaining });
      } else {
        setTimerState({ timeLeft: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isActive, timerState.startTime, timerState.initialTime, setTimerState]);

  // Timer completion
  useEffect(() => {
    if (timerState.timeLeft === 0 && timerState.isActive) {
      const minutes = Math.floor(timerState.initialTime / 60);
      const building = getBuildingConfig(minutes);

      setTimerState({ isActive: false, isCompleted: true });

      // Play completion sound and notification
      soundManager.playComplete();
      notifications.timerComplete(minutes);

      const newSession = {
        id: String(Date.now()),
        type: building.id,
        minutes,
        elapsedSeconds: timerState.initialTime,
        timestamp: new Date(),
        status: 'completed',
      };

      setSessions([...sessions, newSession]);
      toast.success('Focus Complete!', `Great job! You focused for ${minutes} minutes.`);

      // Save to API
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      }).catch(err => console.error('Failed to save session:', err));

      // Clear active timer from server
      fetch('/api/active-timer', { method: 'DELETE' }).catch(() => { });
    }
  }, [timerState.timeLeft, timerState.isActive, timerState.initialTime, sessions, setSessions, setTimerState, toast]);

  // Timer action handler
  const handleTimerAction = useCallback((action, payload) => {
    switch (action) {
      case 'START':
        soundManager.playStart();
        const now = Date.now();
        const startInitial = timerState.isCompleted || timerState.isFailed
          ? timerState.duration * 60
          : timerState.initialTime;

        if (timerState.isCompleted || timerState.isFailed) {
          setTimerState({
            timeLeft: timerState.duration * 60,
            initialTime: timerState.duration * 60,
            startTime: now,
            isActive: true,
            isCompleted: false,
            isFailed: false,
          });
        } else {
          setTimerState({ isActive: true, isFailed: false, startTime: now });
        }

        // Save to server
        fetch('/api/active-timer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startTime: Date.now(),
            durationSeconds: startInitial,
            status: 'active',
          }),
        }).catch(err => console.error('Failed to save active timer:', err));
        break;

      case 'PAUSE':
        soundManager.playPause();
        setTimerState({ isActive: false });

        // Save paused state to server
        fetch('/api/active-timer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            durationSeconds: timerState.initialTime,
            pausedRemaining: timerState.timeLeft,
            status: 'paused',
          }),
        }).catch(err => console.error('Failed to save paused timer:', err));
        break;

      case 'GIVE_UP':
        soundManager.playFailed();
        notifications.timerFailed();
        const elapsed = timerState.initialTime - timerState.timeLeft;
        setTimerState({ isActive: false, isFailed: true });

        const failedSession = {
          id: String(Date.now()),
          type: getBuildingConfig(Math.floor(timerState.initialTime / 60)).id,
          minutes: Math.floor(timerState.initialTime / 60),
          elapsedSeconds: elapsed,
          timestamp: new Date(),
          status: 'failed',
        };
        setSessions([...sessions, failedSession]);

        fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(failedSession),
        }).catch(err => console.error('Failed to save session:', err));

        // Clear active timer from server
        fetch('/api/active-timer', { method: 'DELETE' }).catch(() => { });
        break;

      case 'RESET':
        soundManager.playReset();
        setTimerState({
          isActive: false,
          isCompleted: false,
          isFailed: false,
          timeLeft: timerState.duration * 60,
          initialTime: timerState.duration * 60,
        });

        // Clear active timer from server
        fetch('/api/active-timer', { method: 'DELETE' }).catch(() => { });
        break;

      case 'SET_DURATION':
        const newMinutes = parseInt(payload);
        setTimerState({
          duration: newMinutes,
          timeLeft: newMinutes * 60,
          initialTime: newMinutes * 60,
          isCompleted: false,
          isFailed: false,
        });
        break;
    }
  }, [timerState, setTimerState, sessions, setSessions, soundManager, notifications]);

  // Task handlers
  const handleAddTask = useCallback((text) => {
    if (!text.trim()) return;
    addTask(text);
  }, [addTask]);

  const handleSaveTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.isSaved) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: task.text }),
      });
      if (response.ok) {
        const savedTask = await response.json();
        markTaskSaved(id, savedTask);
        toast.success('Task Saved', 'Your task has been saved to the cloud.');
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('Save Failed', 'Could not save task. Please try again.');
    }
  }, [tasks, markTaskSaved, toast]);

  const handleToggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    toggleTask(id);

    if (task.isSaved) {
      try {
        await fetch(`/api/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !task.completed }),
        });
      } catch (error) {
        console.error('Failed to toggle task:', error);
      }
    }
  }, [tasks, toggleTask]);

  const handleRemoveTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    removeTask(id);

    if (task?.isSaved) {
      try {
        await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to remove task:', error);
      }
    }
  }, [tasks, removeTask]);

  // Calculate stats
  const todayFocusTime = useMemo(() => {
    const today = new Date().toDateString();
    const totalMinutes = sessions.reduce((acc, session) => {
      const sessionDate = new Date(session.timestamp).toDateString();
      if (sessionDate === today) {
        if (session.status === 'completed') {
          return acc + (session.minutes || 0);
        } else if (session.status === 'failed' && session.elapsedSeconds) {
          // Count the actual time spent in failed sessions
          return acc + Math.floor(session.elapsedSeconds / 60);
        }
      }
      return acc;
    }, 0);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  }, [sessions]);


  const completedTasksCount = useMemo(() =>
    tasks.filter(t => t.completed).length,
    [tasks]);

  const currentStreak = useMemo(() => {
    // Calculate streak from sessions
    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    const sessionsByDate = sessions.reduce((acc, s) => {
      const date = new Date(s.timestamp).toDateString();
      if (s.status === 'completed') {
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    while (true) {
      const dateStr = checkDate.toDateString();
      if (sessionsByDate[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (streak === 0) {
        // Check if we missed today but had activity yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        if (!sessionsByDate[checkDate.toDateString()]) break;
      } else {
        break;
      }
    }
    return streak;
  }, [sessions]);

  return (
    <AuthProvider>
      {/* Password Protection Modal */}
      <PasswordModal />

      <div className={cn(
        'flex min-h-screen transition-colors duration-500',
        'bg-slate-50 dark:bg-slate-950',
        isDarkMode ? 'dark' : ''
      )}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className={cn(
          'flex-1 transition-all duration-300',
          'ml-0 w-full',
          'pl-[112px] pr-8 py-8' // Global content padding (Sidebar: 88px + Gap: 24px)
          // Window scrolling enabled
        )}>
          {/* Animated Page Content */}
          <AnimatePresence mode="wait">
            {/* =================================================================
              OVERVIEW TAB
              ================================================================= */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="max-w-7xl mx-auto"
              >
                <LuminaOverview
                  sessions={sessions}
                  tasks={tasks}
                  streak={currentStreak}
                  apps={filteredApps}
                  onAddApp={() => {
                    setEditingApp(null);
                    setIsAddAppModalOpen(true);
                  }}
                  onEditApp={handleEditApp}
                  onDeleteApp={handleDeleteApp}
                  onStartSession={() => setActiveTab('study-tools')}
                  onViewPlan={() => setActiveTab('progress')}
                  userName="Aspirant"
                  onNavigate={setActiveTab}
                />
              </motion.div>
            )}

            {/* =================================================================
              STUDY TOOLS TAB
              ================================================================= */}
            {activeTab === 'study-tools' && (
              <motion.div
                key="study-tools"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <PomodoroTimer
                      state={timerState}
                      onAction={handleTimerAction}
                      isDarkMode={isDarkMode}
                      onToggleTheme={toggleTheme}
                    />
                  </div>
                  <div className="h-[600px] lg:h-auto lg:col-span-2">
                    <Suspense fallback={<CityBuilderLoadingSkeleton />}>
                      <CityBuilder
                        sessionHistory={sessions}
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                      />
                    </Suspense>
                  </div>
                </div>
              </motion.div>
            )}

            {/* =================================================================
              PROGRESS TAB
              ================================================================= */}
            {activeTab === 'progress' && (
              <motion.div
                key="progress"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <ProgressSection
                      sessionHistory={sessions}
                      isDarkMode={isDarkMode}
                      onToggleTheme={toggleTheme}
                    />
                    <SessionHistory sessionHistory={sessions} isDarkMode={isDarkMode} />
                    <div className="h-[500px]">
                      <TodoList
                        tasks={tasks}
                        addTask={handleAddTask}
                        toggleTask={handleToggleTask}
                        removeTask={handleRemoveTask}
                        saveTask={handleSaveTask}
                        saveAllTasks={() => { }}
                      />
                    </div>
                  </Suspense>
                </div>
              </motion.div>
            )}

            {/* =================================================================
              RESOURCES TAB
              ================================================================= */}
            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <ResourceCanvas isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
                </Suspense>
              </motion.div>
            )}

            {/* =================================================================
              AI ASSISTANT TAB
              ================================================================= */}
            {activeTab === 'ai-assistant' && (
              <motion.div
                key="ai-assistant"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <Suspense fallback={<ChatLoadingSkeleton />}>
                  <AIChat isDarkMode={isDarkMode} />
                </Suspense>
              </motion.div>
            )}

            {/* =================================================================
              TEST TAB - Component pending implementation
              ================================================================= */}
            {activeTab === 'test' && (
              <motion.div
                key="test"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <p className="text-lg font-medium">Practice Test</p>
                    <p className="text-sm">Coming soon...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* =================================================================
              ADMIN TAB
              ================================================================= */}
            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <AdminPanel isDarkMode={isDarkMode} />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
          {/* BIG INVISIBLE SPACER */}
          <div className="h-[70px]" />
        </main>

        {/* Command Palette (Cmd+K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(tab) => setActiveTab(tab)}
          onToggleTheme={toggleTheme}
          onStartTimer={() => {
            setActiveTab('study-tools');
            handleTimerAction('START');
          }}
          isDarkMode={isDarkMode}
        />

        {/* Floating Dock Navigation */}
        <Dock
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Add App Modal */}
        <AddAppModal
          isOpen={isAddAppModalOpen}
          onClose={() => {
            setIsAddAppModalOpen(false);
            setEditingApp(null);
          }}
          onSave={handleSaveApp}
          initialData={editingApp}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
