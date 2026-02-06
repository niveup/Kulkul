/**
 * Tests for dateUtils.js - IST (Indian Standard Time) Date Utilities
 * 
 * These are pure functions that handle timezone-specific date operations.
 * IST is UTC + 5:30 (5 hours 30 minutes ahead of UTC)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getISTDate, getTodayIST, isFutureIST, isTodayIST } from './dateUtils';

// =============================================================================
// getISTDate - Returns current date adjusted to IST
// =============================================================================
describe('getISTDate', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns a Date object', () => {
        const result = getISTDate();
        expect(result).toBeInstanceOf(Date);
    });

    it('correctly converts UTC midnight to IST morning', () => {
        // When it's midnight UTC, it's 5:30 AM in IST
        vi.setSystemTime(new Date('2024-01-15T00:00:00Z'));
        const istDate = getISTDate();

        // IST should be 5:30 AM on the same day
        expect(istDate.getHours()).toBe(5);
        expect(istDate.getMinutes()).toBe(30);
    });

    it('correctly handles date change at UTC 18:30 (IST midnight)', () => {
        // At UTC 18:30, it becomes midnight IST (next day)
        vi.setSystemTime(new Date('2024-01-15T18:30:00Z'));
        const istDate = getISTDate();

        // Should be midnight (0:00) on January 16th in IST
        expect(istDate.getHours()).toBe(0);
        expect(istDate.getMinutes()).toBe(0);
        expect(istDate.getDate()).toBe(16);
    });

    it('handles UTC 12:00 correctly (IST 17:30)', () => {
        vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
        const istDate = getISTDate();

        expect(istDate.getHours()).toBe(17);
        expect(istDate.getMinutes()).toBe(30);
    });

    it('handles year boundary correctly', () => {
        // December 31st 20:00 UTC = January 1st 01:30 IST
        vi.setSystemTime(new Date('2023-12-31T20:00:00Z'));
        const istDate = getISTDate();

        expect(istDate.getFullYear()).toBe(2024);
        expect(istDate.getMonth()).toBe(0); // January
        expect(istDate.getDate()).toBe(1);
        expect(istDate.getHours()).toBe(1);
        expect(istDate.getMinutes()).toBe(30);
    });

    it('handles leap year correctly', () => {
        // February 29, 2024 exists (leap year)
        vi.setSystemTime(new Date('2024-02-28T20:00:00Z'));
        const istDate = getISTDate();

        // UTC Feb 28 20:00 = IST Feb 29 01:30
        expect(istDate.getMonth()).toBe(1); // February  
        expect(istDate.getDate()).toBe(29);
    });
});

// =============================================================================
// getTodayIST - Returns start of today (00:00:00) in IST
// =============================================================================
describe('getTodayIST', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns a Date object', () => {
        const result = getTodayIST();
        expect(result).toBeInstanceOf(Date);
    });

    it('returns midnight (00:00:00.000)', () => {
        vi.setSystemTime(new Date('2024-01-15T10:30:45.123Z'));
        const today = getTodayIST();

        expect(today.getHours()).toBe(0);
        expect(today.getMinutes()).toBe(0);
        expect(today.getSeconds()).toBe(0);
        expect(today.getMilliseconds()).toBe(0);
    });

    it('returns correct date in IST context', () => {
        // At UTC 22:00 on Jan 15, it's morning Jan 16 IST
        vi.setSystemTime(new Date('2024-01-15T22:00:00Z'));
        const today = getTodayIST();

        // Should be start of Jan 16 in IST
        expect(today.getDate()).toBe(16);
        expect(today.getMonth()).toBe(0); // January
    });

    it('handles month boundary', () => {
        // January 31st 20:00 UTC = February 1st 01:30 IST
        vi.setSystemTime(new Date('2024-01-31T20:00:00Z'));
        const today = getTodayIST();

        expect(today.getMonth()).toBe(1); // February
        expect(today.getDate()).toBe(1);
    });
});

// =============================================================================
// isFutureIST - Checks if a date is in the future relative to IST today
// =============================================================================
describe('isFutureIST', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns true for a date in the future', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        // Tomorrow in IST context
        const futureDate = new Date('2024-01-17');
        expect(isFutureIST(futureDate)).toBe(true);
    });

    it('returns false for today', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        // Today in IST (Jan 15, 15:30 IST)
        const today = new Date('2024-01-15');
        expect(isFutureIST(today)).toBe(false);
    });

    it('returns false for a date in the past', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        const pastDate = new Date('2024-01-10');
        expect(isFutureIST(pastDate)).toBe(false);
    });

    it('handles string date input', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        expect(isFutureIST('2024-01-20')).toBe(true);
        expect(isFutureIST('2024-01-10')).toBe(false);
    });

    it('handles timestamp input', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        const futureTimestamp = new Date('2024-01-20').getTime();
        const pastTimestamp = new Date('2024-01-10').getTime();

        expect(isFutureIST(futureTimestamp)).toBe(true);
        expect(isFutureIST(pastTimestamp)).toBe(false);
    });

    it('ignores time component - only compares dates', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        // Tomorrow with specific time
        const futureWithTime = new Date('2024-01-17T23:59:59');
        expect(isFutureIST(futureWithTime)).toBe(true);

        // Today at midnight
        const todayMidnight = new Date('2024-01-15T00:00:00');
        expect(isFutureIST(todayMidnight)).toBe(false);
    });

    it('correctly handles IST day boundary', () => {
        // At UTC 20:00 on Jan 15, IST is Jan 16 01:30
        vi.setSystemTime(new Date('2024-01-15T20:00:00Z'));

        // Jan 16 should NOT be future (it's today in IST)
        expect(isFutureIST('2024-01-16')).toBe(false);

        // Jan 17 should be future
        expect(isFutureIST('2024-01-17')).toBe(true);
    });
});

// =============================================================================
// isTodayIST - Checks if a date is today in IST
// =============================================================================
describe('isTodayIST', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns true for today', () => {
        // Set to Jan 15 10:00 UTC = Jan 15 15:30 IST
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        const today = new Date('2024-01-15');
        expect(isTodayIST(today)).toBe(true);
    });

    it('returns false for tomorrow', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        const tomorrow = new Date('2024-01-16');
        expect(isTodayIST(tomorrow)).toBe(false);
    });

    it('returns false for yesterday', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        const yesterday = new Date('2024-01-14');
        expect(isTodayIST(yesterday)).toBe(false);
    });

    it('handles string date input', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        expect(isTodayIST('2024-01-15')).toBe(true);
        expect(isTodayIST('2024-01-14')).toBe(false);
    });

    it('ignores time component', () => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        // Today at various times
        expect(isTodayIST(new Date('2024-01-15T00:00:00'))).toBe(true);
        expect(isTodayIST(new Date('2024-01-15T12:30:45'))).toBe(true);
        expect(isTodayIST(new Date('2024-01-15T23:59:59'))).toBe(true);
    });

    it('correctly handles IST day boundary', () => {
        // At UTC 20:00 on Jan 15, IST is Jan 16 01:30
        vi.setSystemTime(new Date('2024-01-15T20:00:00Z'));

        // In IST, today is Jan 16
        expect(isTodayIST('2024-01-16')).toBe(true);
        expect(isTodayIST('2024-01-15')).toBe(false);
    });

    it('handles month boundary correctly', () => {
        // Jan 31 20:00 UTC = Feb 1 01:30 IST
        vi.setSystemTime(new Date('2024-01-31T20:00:00Z'));

        // In IST, today is Feb 1
        expect(isTodayIST('2024-02-01')).toBe(true);
        expect(isTodayIST('2024-01-31')).toBe(false);
    });

    it('handles year boundary correctly', () => {
        // Dec 31 20:00 UTC = Jan 1 01:30 IST
        vi.setSystemTime(new Date('2023-12-31T20:00:00Z'));

        // In IST, today is Jan 1, 2024
        expect(isTodayIST('2024-01-01')).toBe(true);
        expect(isTodayIST('2023-12-31')).toBe(false);
    });
});
