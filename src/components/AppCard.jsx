import React from 'react';
import * as Icons from 'lucide-react';

// Pastel gradients mapped to IDs for variety
const gradients = [
    'from-blue-100 to-indigo-100 border-blue-200',
    'from-purple-100 to-pink-100 border-purple-200',
    'from-orange-100 to-amber-100 border-orange-200',
    'from-emerald-100 to-teal-100 border-emerald-200',
    'from-cyan-100 to-sky-100 border-cyan-200',
];

const AppCard = ({ app, index }) => {
    const IconComponent = Icons[app.icon] || Icons.HelpCircle;
    const gradientClass = gradients[index % gradients.length];

    return (
        <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative flex flex-col p-6 h-[200px] bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group/card overflow-hidden
                  bg-gradient-to-br ${gradientClass}
                  border border-opacity-50 hover:shadow-lg hover:-translate-y-1 block`}
        >
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/60 rounded-2xl backdrop-blur-sm shadow-sm transition-transform group-hover:scale-110">
                        <IconComponent size={24} className="text-slate-700" />
                    </div>
                    {/* Arrow Icon on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                        <Icons.ExternalLink size={18} className="text-slate-400" />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">
                        {app.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2">
                        {app.description}
                    </p>
                </div>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mix-blend-overlay" />
        </a>
    );
};

export default AppCard;
