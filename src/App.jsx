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
// date-fns import removed - not used

// API Error handling utilities
import { apiRequest, validators } from './utils/apiErrorHandler';

// Components (Eagerly loaded - always needed)
import AppCard, { AddAppCard } from './components/AppCard';
import Sidebar from './components/Sidebar';

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
const Workstation = React.lazy(() => import('./components/workstation/Workstation'));
const AIChat = React.lazy(() => import('./components/tools/AIChat'));
const NotesLibrary2 = React.lazy(() => import('./components/notes/NotesLibrary2'));

const AdminPanel = React.lazy(() => import('./components/tools/AdminPanel'));
const VaultPanel = React.lazy(() => import('./components/tools/VaultPanel'));
const NotionPanel = React.lazy(() => import('./components/notion/NotionPanel'));
const TelegramVideos = React.lazy(() => import('./components/tools/TelegramVideos'));
const VideoApp = React.lazy(() => import('./VideoApp'));
import AddAppModal from './components/AddAppModal';

import { useCustomApps } from './hooks/useCustomApps';

// Widgets
import { StreakHeatmap, BentoDashboard } from './components/widgets';

// Lumina OS Components
import { LuminaOverview } from './components/lumina';

// Store & Hooks
import { useAppStore, useSessionStore, useTaskStore } from './store';
import useDashboardStore from './store/dashboardStore';

import { useHotkey, useOnlineStatus, useDebounce } from './hooks';
import { useToast } from './components/ui/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PasswordModal from './components/PasswordModal';

// Utils
import { cn } from './lib/utils';
import { getBuildingConfig } from './utils/pomodoroConfig';
import { useSoundManager } from './utils/soundManager';
import { useNotifications } from './utils/notificationService';
import { shouldUseLocalStorage } from './utils/authMode';
import { localSessions, localActiveTimer } from './services/localStorageAdapter';
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

const StatsCard = ({ icon: IconComponent, label, value, subtext, gradient, delay = 0 }) => {
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
            <IconComponent size={18} className="text-white/80" />
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
  const isDarkMode = useAppStore(state => state.isDarkMode);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const toggleTheme = useAppStore(state => state.toggleTheme);


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

  // Dashboard store
  const streak = useDashboardStore((s) => s.cachedStats.currentStreak) || 0;
  const userName = 'Aspirant';

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
      addCustomApp(appData);
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
    console.log('handleDeleteApp triggered for:', app);
    const appName = app.name || app.title || 'this app';
    if (window.confirm(`Are you sure you want to delete "${appName}"?`)) {
      console.log('Confirmed deletion of ID:', app.id);
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
      (app.name?.toLowerCase() || '').includes(query) ||
      (app.description && (app.description?.toLowerCase() || '').includes(query))
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

  // Load sessions - localStorage for guest mode, API for authenticated
  useEffect(() => {
    const loadSessionsData = async () => {
      // Guest mode: load from localStorage only
      if (shouldUseLocalStorage()) {
        const localData = localSessions.getAll();
        setSessions(localData);
        setIsLoadingSessions(false);
        return;
      }

      // Authenticated: fetch from API with enhanced error handling
      try {
        const result = await apiRequest('/api/sessions', {
          method: 'GET'
        }, {
          context: 'load-sessions',
          toast,
          defaultMessage: 'Failed to load your session history'
        });

        if (result.success && Array.isArray(result.data)) {
          setSessions(result.data);
        } else {
          // Fallback to localStorage on API failure
          setSessions(localSessions.getAll());
        }
      } catch (error) {
        // Error already handled by apiRequest, fallback to localStorage
        setSessions(localSessions.getAll());
        console.error('Session load failed:', error);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    loadSessionsData();
  }, [setSessions, toast]);

  // Load active timer - localStorage for guest mode, API for authenticated
  const hasLoadedActiveTimer = React.useRef(false);
  useEffect(() => {
    if (hasLoadedActiveTimer.current) return;
    hasLoadedActiveTimer.current = true;

    const loadActiveTimerData = async () => {
      let data = null;

      // Guest mode: load from localStorage
      if (shouldUseLocalStorage()) {
        data = localActiveTimer.get();
      } else {
        // Authenticated: fetch from API with enhanced error handling
        try {
          const result = await apiRequest('/api/active-timer', {
            method: 'GET'
          }, {
            context: 'load-active-timer',
            toast,
            defaultMessage: 'Failed to load active timer state'
          });

          if (result.success) {
            data = result.data;
          }
        } catch (error) {
          // Error already handled by apiRequest, fallback to localStorage
          data = localActiveTimer.get();
          console.error('Active timer load failed:', error);
        }
      }

      if (!data) return;

      if (data.status === 'active' && data.startTime && data.durationSeconds) {
        const elapsed = Math.floor((Date.now() - Number(data.startTime)) / 1000);
        const remaining = data.durationSeconds - elapsed;

        if (remaining > 0) {
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
          // Timer completed while away
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

          const newSession = {
            id: String(Date.now()),
            type: building.id,
            minutes,
            elapsedSeconds: data.durationSeconds,
            timestamp: new Date(),
            status: 'completed',
          };
          setSessions(prev => [...prev, newSession]);

          // Save session - localStorage for guest, API for authenticated
          localSessions.add(newSession);
          if (!shouldUseLocalStorage()) {
            fetch('/api/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newSession),
            }).catch(err => console.error('Failed to save session:', err));
            fetch('/api/active-timer', { method: 'DELETE' }).catch(() => { });
          } else {
            localActiveTimer.clear();
          }

          soundManager.playComplete();
          notifications.timerComplete(minutes);
          toast.success('Focus Complete!', `Session completed while you were away!`);
        }
      } else if (data.status === 'paused' && data.pausedRemaining) {
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
    };
    loadActiveTimerData();
  }, []); // Empty deps - run once on mount

  // Load tasks - skip API in guest mode (Zustand handles localStorage persistence)
  useEffect(() => {
    const loadTasksData = async () => {
      // Guest mode: Zustand already restores from localStorage, just mark as loaded
      if (shouldUseLocalStorage()) {
        setIsLoadingTasks(false);
        return;
      }

      // Authenticated: fetch from API with enhanced error handling
      try {
        const result = await apiRequest('/api/todos', {
          method: 'GET'
        }, {
          context: 'load-tasks',
          toast,
          defaultMessage: 'Failed to load your tasks'
        });

        if (result.success && Array.isArray(result.data)) {
          setTasks(result.data.map(t => ({ ...t, isSaved: true })));
        }
      } catch (error) {
        console.error('Task load failed:', error);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    loadTasksData();
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

      // Save session and clear timer - conditional on auth mode
      localSessions.add(newSession);
      localActiveTimer.clear();

      if (!shouldUseLocalStorage()) {
        // Updated to use apiRequest with proper error handling
        apiRequest('/api/sessions', {
          method: 'POST',
          body: JSON.stringify(newSession),
        }, {
          context: 'save-session',
          toast,
          defaultMessage: 'Failed to save your session data'
        }).catch(err => {
          // Error already handled by apiRequest, but log for debugging
          console.error('Session save failed:', err);
        });

        apiRequest('/api/active-timer', {
          method: 'DELETE'
        }, {
          context: 'clear-active-timer',
          toast,
          showUserMessage: false // Don't show error for cleanup operations
        }).catch(err => {
          console.error('Failed to clear active timer:', err);
        });
      }
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

        // Validate timer duration before starting
        const durationValidation = validators.validateTimerDuration(timerState.duration);
        if (!durationValidation.isValid) {
          toast.error('Invalid Duration', durationValidation.error);
          return;
        }

        // Save timer state - localStorage for guest, API for authenticated
        const timerData = { startTime: now, durationSeconds: startInitial, status: 'active' };
        localActiveTimer.set(timerData);
        if (!shouldUseLocalStorage()) {
          apiRequest('/api/active-timer', {
            method: 'POST',
            body: JSON.stringify(timerData),
          }, {
            context: 'save-active-timer',
            toast,
            defaultMessage: 'Failed to save timer state'
          }).catch(err => {
            console.error('Active timer save failed:', err);
          });
        }
        break;

      case 'PAUSE':
        soundManager.playPause();
        setTimerState({ isActive: false });

        // Save paused state
        const pausedData = { durationSeconds: timerState.initialTime, pausedRemaining: timerState.timeLeft, status: 'paused' };
        localActiveTimer.set(pausedData);
        if (!shouldUseLocalStorage()) {
          apiRequest('/api/active-timer', {
            method: 'POST',
            body: JSON.stringify(pausedData),
          }, {
            context: 'save-paused-timer',
            toast,
            defaultMessage: 'Failed to save paused timer'
          }).catch(err => {
            console.error('Paused timer save failed:', err);
          });
        }
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

        // Save failed session and clear timer
        localSessions.add(failedSession);
        localActiveTimer.clear();
        if (!shouldUseLocalStorage()) {
          apiRequest('/api/sessions', {
            method: 'POST',
            body: JSON.stringify(failedSession),
          }, {
            context: 'save-failed-session',
            toast,
            defaultMessage: 'Failed to save session data'
          }).catch(err => {
            console.error('Failed session save failed:', err);
          });

          apiRequest('/api/active-timer', {
            method: 'DELETE'
          }, {
            context: 'clear-active-timer-failed',
            toast,
            showUserMessage: false
          }).catch(err => {
            console.error('Failed to clear active timer:', err);
          });
        }
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

        // Clear timer
        localActiveTimer.clear();
        if (!shouldUseLocalStorage()) {
          apiRequest('/api/active-timer', {
            method: 'DELETE'
          }, {
            context: 'reset-timer',
            toast,
            showUserMessage: false
          }).catch(err => {
            console.error('Timer reset failed:', err);
          });
        }
        break;

      case 'SET_DURATION':
        const newMinutes = parseInt(payload);
        // Validate duration change
        const durationChangeValidation = validators.validateTimerDuration(newMinutes);
        if (!durationChangeValidation.isValid) {
          toast.error('Invalid Duration', durationChangeValidation.error);
          return;
        }

        setTimerState({
          duration: durationChangeValidation.value,
          timeLeft: durationChangeValidation.value * 60,
          initialTime: durationChangeValidation.value * 60,
          isCompleted: false,
          isFailed: false,
        });
        break;
    }
  }, [timerState, setTimerState, sessions, setSessions, soundManager, notifications]);

  // Task handlers
  const handleAddTask = useCallback((text) => {
    // Validate task text before adding
    const validation = validators.validateTaskText(text);
    if (!validation.isValid) {
      toast.error('Invalid Task', validation.error);
      return;
    }

    addTask(validation.sanitized);
  }, [addTask, toast]);

  const handleSaveTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.isSaved) return;

    // Guest mode: mark as saved locally
    if (shouldUseLocalStorage()) {
      markTaskSaved(id, { ...task, isSaved: true });
      toast.success('Task Saved', 'Your task has been saved locally.');
      return;
    }

    // Authenticated: save to API with proper error handling
    try {
      const response = await apiRequest('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text: task.text }),
      }, {
        context: 'save-task',
        toast,
        defaultMessage: 'Failed to save your task'
      });

      if (response.success) {
        markTaskSaved(id, response.data);
        toast.success('Task Saved', 'Your task has been saved to the cloud.');
      }
    } catch (error) {
      // Error already handled by apiRequest
      console.error('Task save failed:', error);
    }
  }, [tasks, markTaskSaved, toast]);

  // RouteGuard Component to handle side-effects inside AuthProvider
  const RouteGuard = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { activeTab, setActiveTab } = useAppStore();

    useEffect(() => {
      if (isLoading) return;
      if (!isAuthenticated && activeTab !== 'videos') {
        setActiveTab('videos');
      }
    }, [isAuthenticated, isLoading, activeTab, setActiveTab]);

    return null;
  };

  // Main UI Render
  return (
    <AuthProvider>
      <RouteGuard />
      <div className={cn(
        "min-h-screen transition-colors duration-500",
        isDarkMode ? "bg-[#050508] text-white" : "bg-gray-50 text-gray-900"
      )}>
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Command Palette (Global Search) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />

        {/* Quick Add Modals */}
        <AddAppModal
          isOpen={isAddAppModalOpen}
          onClose={() => {
            setIsAddAppModalOpen(false);
            setEditingApp(null);
          }}
          onSave={handleSaveApp}
          initialData={editingApp}
        />



        {/* Main Content Area */}
        <main className="pl-[80px] min-h-screen relative flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-10 py-8"
            >
              <Suspense fallback={<PageLoadingSkeleton />}>
                {activeTab === 'overview' && (
                  <LuminaOverview
                    sessions={sessions}
                    tasks={tasks}
                    apps={filteredApps}
                    streak={streak}
                    userName={userName}
                    onAddApp={() => setIsAddAppModalOpen(true)}
                    onEditApp={handleEditApp}
                    onDeleteApp={handleDeleteApp}
                    onStartSession={() => setActiveTab('study-tools')}
                    onViewPlan={() => setActiveTab('progress')}
                    onNavigate={setActiveTab}
                  />
                )}

                {activeTab === 'study-tools' && (
                  <Workstation
                    timerState={timerState}
                    handleTimerAction={handleTimerAction}
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                    sessions={sessions}
                  />
                )}

                {activeTab === 'progress' && (
                  <ProgressSection sessionHistory={sessions} />
                )}

                {activeTab === 'concept' && (
                  <NotesLibrary2 />
                )}

                {activeTab === 'videos' && (
                  <VideoApp />
                )}

                {activeTab === 'ai-assistant' && (
                  <div className="h-[calc(100vh-8rem)]">
                    <AIChat isDarkMode={isDarkMode} />
                  </div>
                )}

                {activeTab === 'vault' && (
                  <VaultPanel isDarkMode={isDarkMode} />
                )}

                {activeTab === 'notion' && (
                  <NotionPanel />
                )}

                {activeTab === 'admin' && (
                  <AdminPanel isDarkMode={isDarkMode} />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>



          {/* Online/Offline Status Indicator (Subtle) */}
          {!isOnline && (
            <div className="fixed bottom-6 right-6 px-4 py-2 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-full flex items-center gap-2 z-[100]">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-red-400">Offline Mode</span>
            </div>
          )}
        </main>

        {/* Modals & Overlays */}
        <PasswordModal />
      </div>
    </AuthProvider>
  );
}

export default App;

