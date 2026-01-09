/**
 * CustomIcon Component
 * 
 * Renders custom 3D icon images with fallback to Lucide icons.
 * Used for premium navigation icons in Sidebar and Dock.
 */

import React from 'react';
import { cn } from '../../lib/utils';

// Import all custom icon assets
import dashboardIcon from '../../assets/icons/dashboard.png';
import resourcesIcon from '../../assets/icons/resources.png';
import calendarIcon from '../../assets/icons/calendar.png';
import settingsIcon from '../../assets/icons/settings.png';
import analyticsIcon from '../../assets/icons/analytics.jpg';
import profileIcon from '../../assets/icons/profile.png';
import aiIcon from '../../assets/icons/ai.jpg';
import searchIcon from '../../assets/icons/search.png';
import homeIcon from '../../assets/icons/home.png';
import studyIcon from '../../assets/icons/study.png';
import clockIcon from '../../assets/icons/clock.png';
import shieldIcon from '../../assets/icons/shield.png';
import testIcon from '../../assets/icons/test.png';
import commandIcon from '../../assets/icons/command.png';

// Icon mapping
const ICON_MAP = {
    dashboard: dashboardIcon,
    resources: resourcesIcon,
    calendar: calendarIcon,
    settings: settingsIcon,
    analytics: analyticsIcon,
    progress: analyticsIcon, // Alias
    profile: profileIcon,
    user: profileIcon, // Alias
    ai: aiIcon,
    bot: aiIcon, // Alias
    'ai-assistant': aiIcon, // Alias
    search: searchIcon,
    home: homeIcon,
    overview: homeIcon, // Alias
    study: studyIcon,
    'study-tools': clockIcon, // Pomodoro uses clock
    book: studyIcon, // Alias
    clock: clockIcon,
    pomodoro: clockIcon, // Alias
    shield: shieldIcon,
    admin: shieldIcon, // Alias
    test: testIcon,
    clipboard: testIcon, // Alias
    command: commandIcon,
};

const CustomIcon = ({
    name,
    size = 20,
    className,
    fallback: FallbackIcon,
    ...props
}) => {
    const iconSrc = ICON_MAP[name?.toLowerCase()];

    // If no custom icon found and fallback provided, use fallback
    if (!iconSrc && FallbackIcon) {
        return <FallbackIcon size={size} className={className} {...props} />;
    }

    // If no custom icon and no fallback, return null
    if (!iconSrc) {
        console.warn(`CustomIcon: No icon found for "${name}"`);
        return null;
    }

    return (
        <img
            src={iconSrc}
            alt={`${name} icon`}
            width={size}
            height={size}
            className={cn('object-contain', className)}
            draggable={false}
            {...props}
        />
    );
};

export default CustomIcon;
export { ICON_MAP };
