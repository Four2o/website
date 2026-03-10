/**
 * Centralized logging for the Allotment Planner.
 * Provides consistent error reporting and optional debug output.
 */
(function() {
    'use strict';

    const LOG_PREFIX = '[Allotment]';
    const isDev = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.search.includes('debug=1')
    );

    function formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const ctx = context ? ' ' + JSON.stringify(context) : '';
        return `${LOG_PREFIX} [${timestamp}] [${level}] ${message}${ctx}`;
    }

    const logger = {
        error(message, context) {
            const formatted = formatMessage('ERROR', message, context);
            console.error(formatted);
            if (context && context.error) console.error(context.error);
        },
        warn(message, context) {
            const formatted = formatMessage('WARN', message, context);
            console.warn(formatted);
        },
        info(message, context) {
            if (isDev) {
                const formatted = formatMessage('INFO', message, context);
                console.info(formatted);
            }
        },
        debug(message, context) {
            if (isDev) {
                const formatted = formatMessage('DEBUG', message, context);
                console.debug(formatted);
            }
        }
    };

    window.AppLogger = logger;
})();
