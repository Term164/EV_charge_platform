import { NextFunction } from 'express';
import log from './logger';
const requestLogger = (req: Request, _res: Response, next: NextFunction): void => {
    log.info('Method: ', req.method);
    log.info('Path: ', req.url);
    log.info('Body: ', req.body);
    next();
};

export default requestLogger;