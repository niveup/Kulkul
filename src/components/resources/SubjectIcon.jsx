import React, { memo } from 'react';
import { Atom, Calculator, Beaker, BookOpen } from 'lucide-react';

const SubjectIcon = memo(({ subject, isActive, isDarkMode }) => {
    const iconClass = isActive
        ? 'text-white'
        : isDarkMode ? 'text-slate-400' : 'text-slate-500';

    if (subject === 'Physics') return <Atom size={18} className={iconClass} />;
    if (subject === 'Chemistry') return <Beaker size={18} className={iconClass} />;
    if (subject === 'Math') return <Calculator size={18} className={iconClass} />;
    return <BookOpen size={18} className={iconClass} />;
});

export default SubjectIcon;
