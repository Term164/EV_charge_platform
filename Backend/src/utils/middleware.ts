import { Request, Response, NextFunction } from 'express';
import log from './logger';
import config from './config';
import asyncHanlder from 'express-async-handler';
import { SQLStatementManager } from './SQLStatementManager';

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
        response.status(500).send({status: 500, message: 'An error occured.', error: Error.name, data: null});
    } else {
        log.trace(error);
        next(error);
    }
};

const sessionChecker = asyncHanlder(async (request: Request, response: Response, next: NextFunction) => {
    if (config.NODE_ENV == 'test' && !("sessionTest" in request.body)) {
        next();
        return;
    }

    if ('sessionID' in request.body) {
        const result = await SQLStatementManager.getSessionIDStatement.execute({params: [request.body.sessionID]});
        if (result.rows === undefined) throw new Error('result is undefined');
        if (result.rows.length === 0) {
            response.status(401).send({
                status: 400,
                message: "No session with this ID exists.",
                error: "No session with this ID exists.",
                data: null
            });
            return; // Return here so the function stops execution
        }

        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 2); // ! This is needed for the current DB as it is set 2 hours behind our time
        const sessionIDTimeLimit = new Date(result.rows.at(0)[3] as string);

        if (currentDate > sessionIDTimeLimit) {

            void SQLStatementManager.deleteSessionIDStatmenet.execute({params: [request.body.sessionID]});

            response.status(401).send({
                status: 401,
                message: 'This sessionID has expired.',
                error: 'This sessionID has expired.',
                data: null
            });
            return; // Return here so the function stops execution
        }

        await SQLStatementManager.updateSessionIDStatement.execute({params: [request.body.sessionID]});

        next();
    } else {
        response.status(400).send({
            status: 400,
            message: 'No sessionID provided',
            error: 'No sessionID provided',
            data: null
        });
    }
});


export default {
    requestLogger,
    unknownEndpoints,
    errorHandler,
    sessionChecker
};