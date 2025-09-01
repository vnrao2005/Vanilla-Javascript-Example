/**
 * Logger configuration using Pino
 * Provides logging functionality for the entire application
 * @module Logger
 */

/**
 * Send function for Pino browser logger
 * @param {string} level - Log level
 * @param {Object} logEvent - Log event object
 */
function send(level, logEvent) {
    // In a real application, you might send logs to a remote service
    // For now, we'll use console methods based on log level
    const { messages } = logEvent;
    
    switch (level) {
        case 'error':
            console.error(...messages);
            break;
        case 'warn':
            console.warn(...messages);
            break;
        case 'info':
            console.info(...messages);
            break;
        case 'debug':
            console.debug(...messages);
            break;
        default:
            console.log(...messages);
    }
}

// Simple fallback logger (Pino CDN might not be reliable)
const logger = {
    info: (...args) => console.info('[INFO]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    debug: (...args) => console.debug('[DEBUG]', ...args)
};

export default logger;
