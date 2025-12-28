import React from 'react';
import { Home, LayoutGrid, BookOpen, Settings, PieChart, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, onTabChange, isCollapsed, onToggleCollapse }) => {
    const menuItems = [
        { id: 'overview', icon: Home, label: 'Overview' },
        { id: 'study-tools', icon: BookOpen, label: 'Study Tools' },
        { id: 'progress', icon: PieChart, label: 'Progress' },
        { id: 'resources', icon: LayoutGrid, label: 'Resources' },
        { id: 'community', icon: Users, label: 'Community' },
    ];

    return (
        <aside className={`fixed left-0 top-0 h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-white/50 backdrop-blur-xl border-r border-white/40 flex flex-col p-4 z-50 transition-all duration-300`}>
            {/* Logo Area */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-6 px-2`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 flex-shrink-0">
                    S
                </div>
                {!isCollapsed && (
                    <span className="text-xl font-bold text-slate-800 tracking-tight">StudyHub</span>
                )}
            </div>

            {/* Collapse Toggle Button */}
            <button
                onClick={onToggleCollapse}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all z-50"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden mb-1
              ${activeTab === item.id
                            ? 'text-indigo-600 font-semibold bg-white shadow-sm border border-slate-100'
                            : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                        }`}
                    title={isCollapsed ? item.label : ''}
                >
                    <item.icon size={20} className={`flex-shrink-0 transition-colors ${activeTab === item.id ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                    )}
                </button>
            ))}

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 border-t border-slate-200/50">
                <button
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 text-slate-500 hover:text-indigo-600 hover:bg-white/60 rounded-xl transition-all`}
                    title={isCollapsed ? 'Settings' : ''}
                >
                    <Settings size={20} />
                    {!isCollapsed && <span>Settings</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
