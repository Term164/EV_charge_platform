import { Request, Response, NextFunction } from 'express';
import log from './logger';

const requestLogger = (request: Request, _response: Response, next: NextFunction): void => {
    log.info('Request: ', {'Method': request.method, 'Path': request.path}, 'Body:', request.body);
    next();
};

const unknownEndpoints = (_request: Request, response: Response): void => {
    response.status(404).send({
        error: 'unknown endpoint'
    });
};

const errorHandler = (error: Error, _request: Request, _response: Response, next: NextFunction): void => {
    log.error(error.message);
    next("an error occured!"); // TODO: When on dev mode return the actual error when on prod return just an error occured!
};

export default {
    requestLogger,
    unknownEndpoints,
    errorHandler
};