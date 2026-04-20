import Activity from '../models/Activity.js';
import crypto from 'crypto';
import { logger } from './logger.js';

// Native NodeJS memory Map preventing immediate Redis dependency for scale 1
const debounceCache = new Map();

// Fire-and-forget native tracking wrapper ensuring primary threads never block or fault
export const logActivity = (userId, invoiceId, type, metadata = {}) => {
    setImmediate(async () => {
        try {
            let processedMetadata = { ...metadata };

            // Cryptographically secure remote IPs respecting privacy legislation actively
            if (processedMetadata.ip) {
                processedMetadata.ipHash = crypto.createHash('sha256').update(processedMetadata.ip).digest('hex');
                delete processedMetadata.ip;
            }

            // High-concurrency Debounce logic
            if (type === 'VIEWED' && processedMetadata.ipHash) {
                const cacheKey = `${processedMetadata.ipHash}_${invoiceId.toString()}`;
                const lastSeen = debounceCache.get(cacheKey);
                
                // Prevent duplicate analytics triggers inside 5m windows
                if (lastSeen && (Date.now() - lastSeen < 5 * 60 * 1000)) {
                    return;
                }
                debounceCache.set(cacheKey, Date.now());
                
                // Active dynamic cleanup protecting Node V8 memory boundaries 
                if (debounceCache.size > 10000) debounceCache.clear();
            }

            await Activity.create({
                userId,
                invoiceId,
                type,
                metadata: processedMetadata
            });
        } catch (error) {
            logger.error('activity_tracking_failed', { invoiceId, type, error: error.message });
        }
    });
};
