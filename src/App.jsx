import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppCard from './components/AppCard';
import Sidebar from './components/Sidebar';
import PomodoroTimer from './components/tools/PomodoroTimer';
import ExamCountdown from './components/tools/ExamCountdown';
import TodoList from './components/tools/TodoList';
import CityBuilder from './components/tools/CityBuilder';
import ProgressSection from './components/tools/ProgressSection';
import { getBuildingConfig } from './utils/pomodoroConfig';
import appsData from './apps.json';
import { Search, Bell, Moon } from 'lucide-react';
import Resources from './components/tools/Resources';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // State for navigation
  const [filteredApps, setFilteredApps] = useState(appsData);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Sidebar collapse state

  // --- Pomodoro State (Persistent) ---
  const [timerState, setTimerState] = useState({
    duration: 25,
    timeLeft: 25 * 60,
    isActive: false,
    isCompleted: false,
    isFailed: false,
    initialTime: 25 * 60
  });
  const [sessionHistory, setSessionHistory] = useState([]);

  // Timer Ticking Logic
  useEffect(() => {
    let interval = null;
    if (timerState.isActive && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (timerState.timeLeft === 0 && timerState.isActive) {
      // Timer Finished
      const minutes = Math.floor(timerState.initialTime / 60);
      const building = getBuildingConfig(minutes);

      setTimerState(prev => ({ ...prev, isActive: false, isCompleted: true }));
      setSessionHistory(prev => [...prev, {
        id: Date.now(),
        type: building.id,
        minutes: minutes,
        elapsedSeconds: timerState.initialTime,
        timestamp: new Date(),
        status: 'completed'
      }]);
    }
    return () => clearInterval(interval);
  }, [timerState.isActive, timerState.timeLeft, timerState.initialTime]);

  const handleTimerAction = (action, payload) => {
    switch (action) {
      case 'START':
        if (timerState.isCompleted || timerState.isFailed) {
          // Restart logic if previously ended
          setTimerState(prev => ({
            ...prev,
            timeLeft: prev.duration * 60,
            initialTime: prev.duration * 60,
            isActive: true,
            isCompleted: false,
            isFailed: false
          }));
        } else {
          setTimerState(prev => ({ ...prev, isActive: true, isFailed: false }));
        }
        break;
      case 'PAUSE':
        setTimerState(prev => ({ ...prev, isActive: false }));
        break;
      case 'GIVE_UP':
        const currentMinutes = Math.floor(timerState.initialTime / 60);
        const intendedBuilding = getBuildingConfig(currentMinutes);

        const elapsed = timerState.initialTime - timerState.timeLeft;

        setTimerState(prev => ({ ...prev, isActive: false, isFailed: true }));
        setSessionHistory(prev => [...prev, {
          id: Date.now(),
          type: intendedBuilding.id,
          minutes: currentMinutes,
          elapsedSeconds: elapsed,
          timestamp: new Date(),
          status: 'failed'
        }]);
        break;
      case 'RESET':
        setTimerState(prev => ({
          ...prev,
          isActive: false,
          isCompleted: false,
          isFailed: false,
          timeLeft: prev.duration * 60,
          initialTime: prev.duration * 60
        }));
        break;
      case 'SET_DURATION':
        const newMinutes = parseInt(payload);
        setTimerState(prev => ({
          ...prev,
          duration: newMinutes,
          timeLeft: newMinutes * 60,
          initialTime: newMinutes * 60,
          isCompleted: false,
          isFailed: false
        }));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const results = appsData.filter(app =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredApps(results);
  }, [searchTerm]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8 lg:p-12 overflow-y-auto transition-all duration-300`}>

        {/* Top Header - Hide on Resources tab */}
        {activeTab !== 'resources' && (
          <header className={`flex justify-between items-center ${activeTab === 'study-tools' ? 'mb-8' : 'mb-12'} transition-all duration-300`}>
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <span>Home</span>
                <span>/</span>
                <span className="font-medium text-slate-800 capitalize">{activeTab.replace('-', ' ')}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {activeTab === 'overview' ? 'Welcome back, User.' : 'Study Tools'}
              </h1>
            </div>

            {/* Center: Exam Countdown (Study Tools Only) */}
            {activeTab === 'study-tools' && (
              <div className="flex-1 px-8 lg:px-16 min-w-0 -mt-6">
                <ExamCountdown />
              </div>
            )}

            <div className="flex items-center gap-6">
              {/* Search Bar - Only show on Overview for now */}
              {activeTab === 'overview' && (
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-64 rounded-xl bg-white border border-slate-200 
                          focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 
                          text-slate-700 placeholder-slate-400 outline-none transition-all shadow-sm"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl hover:bg-white text-slate-500 hover:text-indigo-600 transition-colors">
                  <Bell size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" alt="User" />
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Dashboard Sections based on Active Tab */}
        <div className="space-y-10">
          <AnimatePresence mode="wait">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <section className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Your Apps</h2>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Customize</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredApps.map((app, index) => (
                      <AppCard key={app.id} app={app} index={index} />
                    ))}

                    {/* Add New App Button - Matching Card Style */}
                    <button className="relative group/btn flex flex-col items-center justify-center p-6 bg-white rounded-3xl border-2 border-dashed border-slate-300 cursor-pointer transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50/50">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-90">
                        <span className="text-3xl text-slate-400 group-hover/btn:text-indigo-500">+</span>
                      </div>
                      <span className="font-semibold text-slate-400 group-hover/btn:text-indigo-600 transition-colors">Add App</span>
                    </button>
                  </div>
                </section>

                {/* Stats / Motivation Section for Overview */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200">
                    <h3 className="font-bold text-indigo-100 mb-1">Focus Time</h3>
                    <p className="text-3xl font-black">4h 20m</p>
                    <p className="text-xs text-indigo-200 mt-2">Today's session</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-1">Tasks Done</h3>
                    <p className="text-3xl font-black text-emerald-500">12</p>
                    <p className="text-xs text-slate-400 mt-2">Productivity high</p>
                  </div>
                </section>
              </motion.div>
            )}

            {/* STUDY TOOLS TAB */}
            {activeTab === 'study-tools' && (
              <motion.div
                key="study-tools"
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <section className="flex flex-col gap-8">
                  {/* Top: Exam Countdown (Moved to Header) - Spacer if needed */}

                  {/* 2-Column Layout: Pomodoro | City Builder */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Timer */}
                    <div className="h-full lg:col-span-1">
                      <PomodoroTimer
                        state={timerState}
                        onAction={handleTimerAction}
                      />
                    </div>

                    {/* Column 2: City Builder (Right - wider) */}
                    <div className="h-[600px] lg:h-auto lg:col-span-2">
                      <CityBuilder sessionHistory={sessionHistory} />
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {/* PROGRESS TAB */}
            {activeTab === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="max-w-4xl mx-auto">
                  <ProgressSection sessionHistory={sessionHistory} />
                </div>
              </motion.div>
            )}

            {/* RESOURCES TAB */}
            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <Resources />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
