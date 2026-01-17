/**
 * Date Utilities for Indian Standard Time (IST)
 * IST is UTC + 5:30
 */

// Get current date object adjusted to IST
export const getISTDate = () => {
    const now = new Date();
    // Get UTC time in ms
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    // Add IST offset (5 hours 30 minutes)
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(utc + istOffset);
};

// Get start of today in IST (00:00:00)
export const getTodayIST = () => {
    const date = getISTDate();
    date.setHours(0, 0, 0, 0);
    return date;
};

// Check if a date is in the future relative to IST today
export const isFutureIST = (date) => {
    const today = getTodayIST();
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
};

// Check if a date is strictly today in IST
export const isTodayIST = (date) => {
    const today = getTodayIST();
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
};
