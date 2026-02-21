// Logger utility — debug logs only in dev, errors always active
const isDev = import.meta.env.DEV;

export const logger = {
    debug: (...args) => isDev && console.log('[DEBUG]', ...args),
    info: (...args) => console.info('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
};
