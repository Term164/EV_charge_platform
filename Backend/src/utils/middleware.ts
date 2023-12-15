import { Request, Response, NextFunction } from 'express';
import { APILogger } from './logger';
import config from './config';
import asyncHandler from 'express-async-handler';
import { SQLStatementManager } from './SQLStatementManager';
import { readFileSync } from 'fs';

const requestLogger = (request: Request, _response: Response, next: NextFunction): void => {
    APILogger.info('Request: ', {'Method': request.method, 'Path': request.path}, 'Body:', request.body);
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
        APILogger.trace(error);
        next(error);
    }
};

const sessionChecker = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
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

// ================================ AUTHORIZATION MIDDLEWARE ============================

type adminData = {
    isbadmin: boolean,
    iscadmin: boolean,
    ispadmin: boolean
};

type pathAuthorizationList = {
    noauth: string[],
    default: string[],
    badmin: string[],
    cadmin: string[],
    padmin: string[]
};

const authListRawData = readFileSync('./src/utils/pathAuthorizationList.json', 'utf8');
const authList = JSON.parse(authListRawData) as pathAuthorizationList;


const authorizationChecker = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {

    if (config.NODE_ENV == 'test' && !("sessionTest" in request.body)) {
        next();
        return;
    }

    let splitPath = request.path.split('/');
    splitPath = splitPath.slice(3);
    const finalPath = '/' + splitPath.join('/');


    if (authList.noauth.includes(finalPath)) {
        next();
        return;
    }

    const data = await SQLStatementManager.checkAdminAuthorizationStatement.execute({params: [request.body.sessionID]});

    if (data.rows == undefined) {
        response.status(500).send({status: 500, message: 'An error occured and we could not authorize this API call, please contact an administrator.', error: 'Database data not recieved', data: null });
        return; // Stop execution
    }

    const adminData: adminData = {
        isbadmin: data.rows[0][0] as boolean,
        iscadmin: data.rows[0][1] as boolean,
        ispadmin: data.rows[0][2] as boolean
    };

    if (adminData.ispadmin) {
        next(); // platform admin has access to all API endpoints
        return;
    } else if (authList.badmin.includes(finalPath)) {
        if (!adminData.isbadmin) {
            APILogger.warn('Unauthorized request to API', request.ip);
            response.status(403).send({status: 403, message: 'You are not a building administrator and cannot make a request to this API endpoint', error: 'Unauthorized request to API', data: null});
        } else next();
        return;
    } else if (authList.cadmin.includes(finalPath)) {
        if (!adminData.iscadmin) {
            APILogger.warn('Unauthorized request to API', request.ip);
            response.status(403).send({status: 403, message: 'You are not a company administrator and cannot make a request to this API endpoint', error: 'Unauthorized request to API', data: null});
        } else next();
        return;
    } else next();
});


export default {
    requestLogger,
    unknownEndpoints,
    errorHandler,
    sessionChecker,
    authorizationChecker
};