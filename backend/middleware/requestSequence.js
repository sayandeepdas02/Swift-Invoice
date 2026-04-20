import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage();

export const requestSequenceMiddleware = (req, res, next) => {
    const requestId = uuidv4();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    asyncLocalStorage.run(new Map([['requestId', requestId]]), () => {
        next();
    });
};
