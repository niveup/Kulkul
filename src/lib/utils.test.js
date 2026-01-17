/**
 * Tests for utility functions in lib/utils.js
 * 
 * These are pure functions - ideal for unit testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    cn,
    formatNumber,
    truncate,
    getInitials,
    debounce,
    throttle,
    generateId,
    safeJsonParse,
    getGreeting,
    formatRelativeTime,
    isKey,
    Keys,
} from '../lib/utils';

// =============================================================================
// cn (classnames utility)
// =============================================================================
describe('cn', () => {
    it('merges multiple class strings', () => {
        expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
    });

    it('handles conditional classes', () => {
        expect(cn('base', true && 'active')).toBe('base active');
        expect(cn('base', false && 'inactive')).toBe('base');
    });

    it('merges conflicting Tailwind classes correctly', () => {
        // tailwind-merge should keep the last padding value
        expect(cn('px-4', 'px-6')).toBe('px-6');
    });

    it('handles arrays of classes', () => {
        expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2');
    });

    it('handles undefined and null values', () => {
        expect(cn('base', undefined, null, 'extra')).toBe('base extra');
    });

    it('handles objects with boolean values', () => {
        expect(cn({ active: true, disabled: false })).toBe('active');
    });
});

// =============================================================================
// formatNumber
// =============================================================================
describe('formatNumber', () => {
    it('formats numbers with Indian locale', () => {
        // Indian number format uses different grouping
        expect(formatNumber(1000)).toBe('1,000');
        expect(formatNumber(100000)).toBe('1,00,000');
        expect(formatNumber(10000000)).toBe('1,00,00,000');
    });

    it('handles zero', () => {
        expect(formatNumber(0)).toBe('0');
    });

    it('handles decimal numbers', () => {
        expect(formatNumber(1234.56)).toContain('1,234');
    });
});

// =============================================================================
// truncate
// =============================================================================
describe('truncate', () => {
    it('truncates text longer than maxLength', () => {
        const result = truncate('This is a very long string', 10);
        expect(result).toBe('This is a...');
        expect(result.length).toBe(12); // 9 chars after trim + '...'
    });

    it('returns original text if shorter than maxLength', () => {
        expect(truncate('Short', 10)).toBe('Short');
    });

    it('returns original text if equal to maxLength', () => {
        expect(truncate('ExactLength', 11)).toBe('ExactLength');
    });

    it('handles empty string', () => {
        expect(truncate('', 10)).toBe('');
    });

    it('handles null/undefined', () => {
        expect(truncate(null, 10)).toBe(null);
        expect(truncate(undefined, 10)).toBe(undefined);
    });

    it('uses default maxLength of 50', () => {
        const longText = 'a'.repeat(60);
        expect(truncate(longText).length).toBe(53); // 50 + '...'
    });
});

// =============================================================================
// getInitials
// =============================================================================
describe('getInitials', () => {
    it('returns initials from two words', () => {
        expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns initials from single word', () => {
        expect(getInitials('John')).toBe('J');
    });

    it('limits to 2 characters', () => {
        expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('handles empty string', () => {
        expect(getInitials('')).toBe('?');
    });

    it('handles null/undefined', () => {
        expect(getInitials(null)).toBe('?');
        expect(getInitials(undefined)).toBe('?');
    });

    it('converts to uppercase', () => {
        expect(getInitials('john doe')).toBe('JD');
    });
});

// =============================================================================
// debounce
// =============================================================================
describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('delays function execution', () => {
        const fn = vi.fn();
        const debouncedFn = debounce(fn, 300);

        debouncedFn();
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(300);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('resets timer on subsequent calls', () => {
        const fn = vi.fn();
        const debouncedFn = debounce(fn, 300);

        debouncedFn();
        vi.advanceTimersByTime(200);
        debouncedFn(); // Reset timer
        vi.advanceTimersByTime(200);
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments to the original function', () => {
        const fn = vi.fn();
        const debouncedFn = debounce(fn, 300);

        debouncedFn('arg1', 'arg2');
        vi.advanceTimersByTime(300);

        expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
});

// =============================================================================
// throttle
// =============================================================================
describe('throttle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('executes immediately on first call', () => {
        const fn = vi.fn();
        const throttledFn = throttle(fn, 300);

        throttledFn();
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('blocks subsequent calls within throttle period', () => {
        const fn = vi.fn();
        const throttledFn = throttle(fn, 300);

        throttledFn();
        throttledFn();
        throttledFn();
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('allows calls after throttle period', () => {
        const fn = vi.fn();
        const throttledFn = throttle(fn, 300);

        throttledFn();
        vi.advanceTimersByTime(300);
        throttledFn();

        expect(fn).toHaveBeenCalledTimes(2);
    });
});

// =============================================================================
// generateId
// =============================================================================
describe('generateId', () => {
    it('generates unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
    });

    it('includes prefix when provided', () => {
        const id = generateId('task');
        expect(id.startsWith('task-')).toBe(true);
    });

    it('generates IDs without prefix', () => {
        const id = generateId();
        expect(id).not.toContain('-');
    });

    it('generates string IDs', () => {
        expect(typeof generateId()).toBe('string');
    });
});

// =============================================================================
// safeJsonParse
// =============================================================================
describe('safeJsonParse', () => {
    it('parses valid JSON', () => {
        expect(safeJsonParse('{"key": "value"}')).toEqual({ key: 'value' });
    });

    it('returns fallback for invalid JSON', () => {
        expect(safeJsonParse('invalid json', { default: true })).toEqual({ default: true });
    });

    it('returns null as default fallback', () => {
        expect(safeJsonParse('invalid')).toBeNull();
    });

    it('parses arrays', () => {
        expect(safeJsonParse('[1, 2, 3]')).toEqual([1, 2, 3]);
    });

    it('parses primitive values', () => {
        expect(safeJsonParse('"string"')).toBe('string');
        expect(safeJsonParse('123')).toBe(123);
        expect(safeJsonParse('true')).toBe(true);
    });
});

// =============================================================================
// getGreeting
// =============================================================================
describe('getGreeting', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns "Good Morning" before noon', () => {
        vi.setSystemTime(new Date('2024-01-01T09:00:00'));
        expect(getGreeting()).toBe('Good Morning');
    });

    it('returns "Good Afternoon" between 12-17', () => {
        vi.setSystemTime(new Date('2024-01-01T14:00:00'));
        expect(getGreeting()).toBe('Good Afternoon');
    });

    it('returns "Good Evening" between 17-21', () => {
        vi.setSystemTime(new Date('2024-01-01T19:00:00'));
        expect(getGreeting()).toBe('Good Evening');
    });

    it('returns "Good Night" after 21', () => {
        vi.setSystemTime(new Date('2024-01-01T22:00:00'));
        expect(getGreeting()).toBe('Good Night');
    });
});

// =============================================================================
// formatRelativeTime
// =============================================================================
describe('formatRelativeTime', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-15T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns "just now" for times < 1 minute ago', () => {
        const date = new Date('2024-01-15T11:59:30');
        expect(formatRelativeTime(date)).toBe('just now');
    });

    it('returns minutes for times < 1 hour ago', () => {
        const date = new Date('2024-01-15T11:30:00');
        expect(formatRelativeTime(date)).toBe('30m ago');
    });

    it('returns hours for times < 1 day ago', () => {
        const date = new Date('2024-01-15T09:00:00');
        expect(formatRelativeTime(date)).toBe('3h ago');
    });

    it('returns days for times < 1 week ago', () => {
        const date = new Date('2024-01-13T12:00:00');
        expect(formatRelativeTime(date)).toBe('2d ago');
    });

    it('returns formatted date for times > 1 week ago', () => {
        const date = new Date('2024-01-01T12:00:00');
        const result = formatRelativeTime(date);
        expect(result).toContain('Jan');
        expect(result).toContain('1');
    });
});

// =============================================================================
// isKey and Keys
// =============================================================================
describe('isKey', () => {
    it('matches single key', () => {
        const event = { key: 'Enter' };
        expect(isKey(event, 'Enter')).toBe(true);
        expect(isKey(event, 'Escape')).toBe(false);
    });

    it('matches array of keys', () => {
        const event = { key: 'Enter' };
        expect(isKey(event, ['Enter', 'Space'])).toBe(true);
        expect(isKey(event, [' ', 'Escape'])).toBe(false);
    });

    it('works with Keys constants', () => {
        const event = { key: 'Enter' };
        expect(isKey(event, Keys.Enter)).toBe(true);
        expect(isKey(event, Keys.Escape)).toBe(false);
    });
});

describe('Keys', () => {
    it('has correct key values', () => {
        expect(Keys.Enter).toBe('Enter');
        expect(Keys.Space).toBe(' ');
        expect(Keys.Escape).toBe('Escape');
        expect(Keys.ArrowUp).toBe('ArrowUp');
    });
});
