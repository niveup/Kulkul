import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { X, TrendingUp } from 'lucide-react';

// Register only what we need
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const TopicAnalysisModal = ({ isOpen, onClose, topicData, isDarkMode }) => {
    if (!isOpen || !topicData || !topicData.concepts) return null;

    const concepts = topicData.concepts;
    const totalConcepts = concepts.length;
    const jeeFavs = concepts.filter(c => c.isJeeFav).length;
    const hasFormula = concepts.filter(c => c.formula).length;
    const hasShortcut = concepts.filter(c => c.shortcut).length;

    const doughnutData = {
        labels: ['JEE Important', 'Standard'],
        datasets: [{
            data: [jeeFavs, totalConcepts - jeeFavs],
            backgroundColor: ['#6366f1', '#94a3b8'],
            borderWidth: 0,
        }],
    };

    // JEE Mains Questions by Year - Data sourced from User Provided Analysis (MatchonGo/Allen/ExamSide)
    // Labels: ['2021', '2022', '2023', '2024', '2025 (Est)']
    const jeeQuestionsPerTopic = {
        // --- CLASS 11 ---
        'Units, Dimensions, Errors and Measurements': [25, 24, 23, 22, 20],
        'Kinematics': [35, 32, 30, 30, 28], // Motion in Straight Line + Plane
        'Laws of Motion': [28, 26, 25, 24, 22],
        'Work, Energy and Power': [25, 23, 22, 24, 22],
        'Rotational Motion': [54, 35, 30, 28, 25],
        'Gravitation': [30, 28, 32, 26, 24],
        'Thermodynamics': [52, 38, 42, 35, 36], // Heat + Thermo
        'Kinetic Theory of Gases': [15, 12, 14, 12, 10], // Often grouped with Thermo
        'Oscillations': [20, 18, 18, 16, 15],
        'Waves': [18, 16, 16, 14, 12],
        'Properties of Matter': [22, 20, 18, 16, 15], // Solids + Fluids

        // --- CLASS 12 ---
        'Electrostatics': [65, 48, 55, 45, 48],
        'Capacitance': [22, 20, 18, 20, 18], // Capacitor
        'Current Electricity': [82, 55, 68, 54, 52],
        'Magnetism': [45, 42, 48, 40, 42], // Moving Charges + Magnetism Matter
        'Moving Charges and Magnetism': [30, 28, 32, 28, 30],
        'Magnetism and Matter': [15, 14, 16, 12, 12],
        'EMI & AC': [80, 50, 55, 45, 40], // Combined
        'Electromagnetic Induction': [25, 20, 20, 22, 18],
        'Alternating Current': [58, 30, 35, 23, 22],
        'Electromagnetic Waves': [20, 18, 18, 19, 18],
        'Ray Optics': [58, 42, 45, 38, 40], // Geometrical Optics
        'Wave Optics': [25, 20, 22, 20, 18],
        'Modern Physics': [125, 85, 98, 68, 65], // High Weightage!
        'Dual Nature of Radiation': [45, 30, 35, 25, 24],
        'Atoms': [30, 20, 25, 18, 18],
        'Nuclei': [30, 20, 25, 18, 18],
        'Semiconductor Electronics': [48, 34, 36, 32, 30]
    };

    // Get the data for the current topic, or use default (Average estimate)
    const topicName = topicData.topic;
    // Try exact match, or partial match, or default
    const yearlyQuestions = jeeQuestionsPerTopic[topicName] ||
        jeeQuestionsPerTopic[Object.keys(jeeQuestionsPerTopic).find(k => topicName.includes(k) || k.includes(topicName))] ||
        [15, 15, 15, 15, 15]; // Default fallback

    const jeeYearlyData = {
        labels: ['2021', '2022', '2023', '2024', '2025'],
        datasets: [{
            label: 'Total Questions Asked',
            data: yearlyQuestions,
            backgroundColor: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'],
            hoverBackgroundColor: '#4f46e5',
            borderRadius: 6,
            barThickness: 32,
        }],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.raw} Questions`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    const simpleOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}>

                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-indigo-500" size={24} />
                        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{topicData.topic} - Analytics</h2>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                        <X size={20} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                    </button>
                </div>

                {/* Charts */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Doughnut */}
                    <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        <h3 className={`text-sm font-bold mb-4 text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>JEE Relevance</h3>
                        <div className="h-48 flex items-center justify-center">
                            <Doughnut data={doughnutData} options={simpleOptions} />
                        </div>
                        <p className="text-center text-2xl font-bold text-indigo-500 mt-2">
                            {totalConcepts > 0 ? Math.round((jeeFavs / totalConcepts) * 100) : 0}%
                        </p>
                        <p className={`text-center text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>JEE Important</p>
                    </div>

                    {/* Bar - JEE Mains Yearly Questions */}
                    <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        <h3 className={`text-sm font-bold mb-4 text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>JEE Mains Total Questions (Year-wise)</h3>
                        <div className="h-48">
                            <Bar data={jeeYearlyData} options={barOptions} />
                        </div>
                    </div>

                </div>

                {/* Stats Row */}
                <div className="px-6 pb-6 grid grid-cols-3 gap-4">
                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                        <p className="text-2xl font-bold text-indigo-500">{totalConcepts}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Concepts</p>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                        <p className="text-2xl font-bold text-purple-500">{hasFormula}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Formulas</p>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-cyan-900/30' : 'bg-cyan-50'}`}>
                        <p className="text-2xl font-bold text-cyan-500">{hasShortcut}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Shortcuts</p>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default TopicAnalysisModal;
