import { asyncLocalStorage } from '../middleware/requestSequence.js';

const formatMessage = (level, event, metadata) => {
    // Attempt to extract the correlation ID if running within an express request context
    const store = asyncLocalStorage.getStore();
    const requestId = store ? store.get('requestId') : 'background-worker';

    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        event,
        requestId,
        ...metadata
    };

    // Return strict structured JSON string
    return JSON.stringify(logEntry);
};

export const logger = {
    info: (event, metadata = {}) => console.log(formatMessage('info', event, metadata)),
    warn: (event, metadata = {}) => console.warn(formatMessage('warn', event, metadata)),
    error: (event, metadata = {}) => {
        // Automatically unpack error stacks if passing an Error object
        if (metadata.error instanceof Error) {
            metadata.errorMessage = metadata.error.message;
            metadata.errorStack = metadata.error.stack;
            delete metadata.error;
        }
        console.error(formatMessage('error', event, metadata));
    }
};
