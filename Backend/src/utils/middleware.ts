import { Request, Response, NextFunction } from 'express';
import log from './logger';
import config from './config';

const requestLogger = (request: Request, _response: Response, next: NextFunction): void => {
    log.info('Request: ', {'Method': request.method, 'Path': request.path}, 'Body:', request.body);
    next();
};

const unknownEndpoints = (_request: Request, response: Response): void => {
    response.status(404).send({
        error: 'unknown endpoint'
    });
};

const errorHandler = (error: Error, _request: Request, response: Response, next: NextFunction): void => {
    if (config.NODE_ENV == 'production' || config.NODE_ENV == 'test' ) {
        response.status(500).send({"Failed": "An error occured."});
    } else {
        log.trace(error);
        next(error);
    }
};

export default {
    requestLogger,
    unknownEndpoints,
    errorHandler
};