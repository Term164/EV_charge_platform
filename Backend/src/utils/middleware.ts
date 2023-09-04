import { Request, Response, NextFunction } from 'express';
import log from './logger';
import config from './config';
import asyncHanlder from 'express-async-handler';
import db from '.././utils/database';
import { DataTypeOIDs } from 'postgresql-client';

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

const sessionChecker = asyncHanlder(async (request: Request, response: Response, next: NextFunction) => {
    if (config.NODE_ENV == 'test' && !("sessionTest" in request.body)) {
        next();
        return;
    }

    if ('sessionID' in request.body) {
        const statement = await db.connection.prepare(
            `SELECT * FROM Sessions
            WHERE session_secret = $1`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        const result = await statement.execute({params: [request.body.sessionID]});
        if (result.rows === undefined) throw new Error('result is undefined');
        if (result.rows.length === 0) {
            response.status(401).send({
                "error": "No session with this ID exists."
            });
            return; // Return here so the function stops execution
        }

        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 2); // ! This is needed for the current DB as it is set 2 hours behind our time
        const sessionIDTimeLimit = new Date(result.rows.at(0)[3] as string);

        if (currentDate > sessionIDTimeLimit) {
            const removeSessionIDStatement = await db.connection.prepare(
                `DELETE FROM Sessions
                WHERE session_secret = $1`,
                {paramTypes: [DataTypeOIDs.varchar]}
            );

            void removeSessionIDStatement.execute({params: [request.body.sessionID]});

            response.status(401).send({
                error: 'This sessionID has expired.'
            });
            return; // Return here so the function stops execution
        }

        const updateSessionIDStatment = await db.connection.prepare(
            `UPDATE Sessions
            SET expiration_time = NOW() + interval '30 minutes'
            WHERE session_secret = $1`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        await updateSessionIDStatment.execute({params: [request.body.sessionID]});

        next();
    } else {
        response.status(400).send({
            error: 'No sessionID provided'
        });
    }
});


export default {
    requestLogger,
    unknownEndpoints,
    errorHandler,
    sessionChecker
};