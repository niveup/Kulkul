import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, TrendingUp, Brain, Flame, ChevronLeft, ChevronRight, BookOpen, RefreshCw } from 'lucide-react';

// Heatmap Component
function StudyHeatmap({ studyActivity, isDarkMode }) {
    // Get local date string (YYYY-MM-DD) without timezone issues
    const getLocalDateStr = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTodayStr = () => getLocalDateStr(new Date());

    // Selected day state - defaults to today
    const [selectedDay, setSelectedDay] = useState(() => {
        const today = new Date();
        const todayStr = getLocalDateStr(today);
        return {
            date: today,
            dateStr: todayStr,
            count: studyActivity[todayStr]?.count || 0,
            topics: studyActivity[todayStr]?.topics || [],
            inYear: true,
            isFuture: false
        };
    });
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Update selected day when activity changes
    useEffect(() => {
        const todayStr = getTodayStr();
        if (selectedDay.dateStr === todayStr) {
            setSelectedDay(prev => ({
                ...prev,
                count: studyActivity[todayStr]?.count || 0,
                topics: studyActivity[todayStr]?.topics || []
            }));
        }
    }, [studyActivity]);

    // Generate array of dates for the heatmap - full year always
    const heatmapData = useMemo(() => {
        const data = [];
        const now = new Date();
        const todayStr = getLocalDateStr(now);
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);

        const firstDay = new Date(startDate);
        firstDay.setDate(firstDay.getDate() - firstDay.getDay());

        let currentDate = new Date(firstDay);
        while (currentDate <= endDate || data.length % 7 !== 0) {
            const dateStr = getLocalDateStr(currentDate);
            const activity = studyActivity[dateStr] || { count: 0, topics: [] };
            const isInYear = currentDate.getFullYear() === currentYear;
            const isFuture = dateStr > todayStr;

            data.push({
                date: new Date(currentDate),
                dateStr,
                count: activity.count,
                topics: activity.topics,
                inYear: isInYear,
                isFuture: isFuture
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return data;
    }, [studyActivity, currentYear]);

    // Group by weeks
    const weeks = useMemo(() => {
        const result = [];
        for (let i = 0; i < heatmapData.length; i += 7) {
            result.push(heatmapData.slice(i, i + 7));
        }
        return result;
    }, [heatmapData]);

    // Calculate month positions for labels
    const monthPositions = useMemo(() => {
        const positions = [];
        let lastMonth = -1;
        weeks.forEach((week, weekIdx) => {
            const firstDayOfWeek = week.find(d => d.inYear);
            if (firstDayOfWeek) {
                const month = firstDayOfWeek.date.getMonth();
                if (month !== lastMonth) {
                    positions.push({ month, weekIdx });
                    lastMonth = month;
                }
            }
        });
        return positions;
    }, [weeks]);

    const getIntensityClass = (count, inYear, isFuture) => {
        if (!inYear) return isDarkMode ? 'bg-slate-900/30' : 'bg-slate-100';
        if (isFuture) return isDarkMode ? 'bg-slate-800/50 border border-dashed border-slate-600' : 'bg-slate-100 border border-dashed border-slate-300';
        if (count === 0) return isDarkMode ? 'bg-slate-800' : 'bg-slate-200';
        if (count === 1) return 'bg-emerald-300 dark:bg-emerald-900';
        if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-700';
        if (count <= 5) return 'bg-emerald-500 dark:bg-emerald-500';
        return 'bg-emerald-600 dark:bg-emerald-400';
    };

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const isToday = (dateStr) => dateStr === getTodayStr();
    const isSelected = (dateStr) => dateStr === selectedDay?.dateStr;

    return (
        <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Study Consistency</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentYear(y => y - 1)}
                        className={`p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className={`text-sm font-medium min-w-[50px] text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{currentYear}</span>
                    <button
                        onClick={() => setCurrentYear(y => Math.min(y + 1, 2026))}
                        disabled={currentYear >= 2026}
                        className={`p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Month Labels */}
            <div className="relative h-4 mb-1 ml-8">
                {monthPositions.map(({ month, weekIdx }) => (
                    <span
                        key={`${month}-${weekIdx}`}
                        className={`absolute text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                        style={{ left: `${weekIdx * 15}px` }}
                    >
                        {monthLabels[month]}
                    </span>
                ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-[2px] overflow-x-auto pb-2">
                <div className="flex flex-col gap-[2px] text-xs text-slate-500 pr-1">
                    <span className="h-3">M</span>
                    <span className="h-3"></span>
                    <span className="h-3">W</span>
                    <span className="h-3"></span>
                    <span className="h-3">F</span>
                    <span className="h-3"></span>
                    <span className="h-3">S</span>
                </div>
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[2px]">
                        {week.map((day, dayIdx) => (
                            <div
                                key={dayIdx}
                                className={`w-3 h-3 rounded-sm transition-colors ${getIntensityClass(day.count, day.inYear, day.isFuture)} ${day.inYear ? 'cursor-pointer' : 'cursor-default'
                                    } ${isSelected(day.dateStr) ? 'ring-2 ring-indigo-500' : ''
                                    } ${isToday(day.dateStr) ? 'ring-2 ring-emerald-400' : ''}`}
                                onClick={() => day.inYear && setSelectedDay(day)}
                                title={day.inYear ? `${day.dateStr}${day.isFuture ? ' (Future)' : `: ${day.count} topics`}` : ''}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-3">
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Less</span>
                <div className="flex gap-1">
                    <div className={`w-3 h-3 rounded-sm ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-900" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>More</span>
            </div>

            {/* Selected Day Info Panel */}
            <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isToday(selectedDay?.dateStr) ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {selectedDay ? new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a day'}
                            {isToday(selectedDay?.dateStr) && <span className="ml-2 text-xs text-emerald-500 font-normal">(Today)</span>}
                        </span>
                    </div>
                    <span className={`text-sm font-semibold ${selectedDay?.count > 0
                            ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                            : (isDarkMode ? 'text-slate-400' : 'text-slate-500')
                        }`}>
                        {selectedDay?.count || 0} topic{selectedDay?.count !== 1 ? 's' : ''} reviewed
                    </span>
                </div>
                {selectedDay?.topics?.length > 0 && (
                    <div className={`mt-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Topics: </span>
                        {selectedDay.topics.slice(0, 5).join(', ')}
                        {selectedDay.topics.length > 5 && ` +${selectedDay.topics.length - 5} more`}
                    </div>
                )}
                {(!selectedDay?.topics || selectedDay?.topics?.length === 0) && selectedDay?.count === 0 && (
                    <div className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        No topics reviewed on this day
                    </div>
                )}
            </div>
        </div>
    );
}

// Topic Card - Simple version without urgency
function TopicCard({ topic, isDarkMode }) {
    return (
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'} border transition-all`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${topic.class === '11'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-sky-500/20 text-sky-400'
                            }`}>
                            Class {topic.class}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {topic.subject}
                        </span>
                    </div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{topic.topicName}</h4>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-slate-400" />
                            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {topic.reviewCount || 0} reviews
                            </span>
                        </div>
                        {topic.lastReviewed && (
                            <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                Last: {new Date(topic.lastReviewed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stats Cards - Simplified without Due/Overdue
function StatsCards({ topics, streakDays, studyActivity, isDarkMode }) {
    const stats = useMemo(() => {
        let totalReviews = 0;
        let uniqueTopics = topics.length;

        topics.forEach(t => {
            totalReviews += t.reviewCount || 0;
        });

        // Count total study days
        const studyDays = Object.keys(studyActivity).filter(date => studyActivity[date]?.count > 0).length;

        return { totalReviews, uniqueTopics, studyDays };
    }, [topics, studyActivity]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-700/50' : 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                    <Flame className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Current Streak</span>
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{streakDays} days</div>
            </div>

            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-700/50' : 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Reviews</span>
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.totalReviews}</div>
            </div>

            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700/50' : 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                    <BookOpen className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Topics Tracked</span>
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.uniqueTopics}</div>
            </div>

            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-700/50' : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                    <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Study Days</span>
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.studyDays}</div>
            </div>
        </div>
    );
}

// Main Component - Simplified
export default function SpacedRepetition({ isDarkMode = false }) {
    const [topics, setTopics] = useState([]);
    const [studyActivity, setStudyActivity] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [streakDays, setStreakDays] = useState(0);
    const [filter, setFilter] = useState('all'); // all, class11, class12

    // Load data from API
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/api/srs/topics');
                if (response.ok) {
                    const data = await response.json();
                    setTopics(data.topics || []);
                    setStudyActivity(data.activity || {});
                    setStreakDays(data.streak || 0);
                }
            } catch (error) {
                console.error('Failed to load study data:', error);
                setTopics([]);
                setStudyActivity({});
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter topics
    const filteredTopics = useMemo(() => {
        let result = [...topics];

        if (filter === 'class11') {
            result = result.filter(t => t.class === '11');
        } else if (filter === 'class12') {
            result = result.filter(t => t.class === '12');
        }

        // Sort by most recently reviewed
        result.sort((a, b) => {
            const aDate = a.lastReviewed ? new Date(a.lastReviewed) : new Date(0);
            const bDate = b.lastReviewed ? new Date(b.lastReviewed) : new Date(0);
            return bDate - aDate;
        });

        return result;
    }, [topics, filter]);

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center h-48 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading study data...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-indigo-500'}`}>
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            Study Tracker
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Track your physics revision progress
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCards topics={topics} streakDays={streakDays} studyActivity={studyActivity} isDarkMode={isDarkMode} />

            {/* Heatmap */}
            <StudyHeatmap studyActivity={studyActivity} isDarkMode={isDarkMode} />

            {/* Topics List */}
            <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            Topics You've Studied
                        </h3>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        {['all', 'class11', 'class12'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === f
                                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white')
                                    : (isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                                    }`}
                            >
                                {f === 'all' ? 'All' : f === 'class11' ? 'Class 11' : 'Class 12'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Topic Cards */}
                {filteredTopics.length === 0 ? (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No topics tracked yet!</p>
                        <p className="text-sm mt-1">
                            Click on topics in Resources to start tracking.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                        {filteredTopics.slice(0, 20).map(topic => (
                            <TopicCard
                                key={topic.topicId}
                                topic={topic}
                                isDarkMode={isDarkMode}
                            />
                        ))}
                    </div>
                )}

                {filteredTopics.length > 20 && (
                    <div className={`mt-4 text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        +{filteredTopics.length - 20} more topics
                    </div>
                )}
            </div>
        </div>
    );
}
