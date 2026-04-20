import { logger } from '../services/logger.js';

export const withRetries = async (operation, maxRetries = 3) => {
    let attempt = 0;
    
    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error) {
            attempt++;
            
            if (attempt >= maxRetries) {
                logger.error('operation_failed_max_retries_exceeded', { error, attempts: attempt });
                throw error;
            }
            
            // Exponential backoff: 1s, 2s, 4s...
            const delayMs = Math.pow(2, attempt - 1) * 1000;
            logger.warn('operation_retry_attempt', { attempt, delayMs, error: error.message });
            
            await new Promise(res => setTimeout(res, delayMs));
        }
    }
};
