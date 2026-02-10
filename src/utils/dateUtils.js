/**
 * Date Utilities for Indian Standard Time (IST)
 * IST is UTC + 5:30
 */

// Get current date object adjusted to IST
export const getISTDate = () => {
    // Standard way to get IST regardless of local system time
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const istString = new Intl.DateTimeFormat('en-US', options).format(new Date());
    return new Date(istString);
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
