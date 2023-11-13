import { Logger, ILogObj } from 'tslog';
import config from './config';
import { appendFileSync } from 'fs';


const log: Logger<ILogObj> = new Logger({name: "MainLogger", minLevel: config.LOG_LEVEL});
const OCPPLogger = log.getSubLogger({name: "OCPPLogger"});
const APILogger = log.getSubLogger({name: "APILogger"});

// TODO: Change the stdout to file on prodcution... check ts-log documentation

if (config.NODE_ENV == 'production') {
    log.settings.hideLogPositionForProduction = true;
    // All logs
    log.attachTransport((logObj: ILogObj): void => {
        appendFileSync('logs.txt', JSON.stringify(logObj) + "\n");
    });
    // Logs specific for OCPP
    OCPPLogger.attachTransport((LogObj: ILogObj): void => {
        appendFileSync('OCPPlogs.txt', JSON.stringify(LogObj) + "\n");
    });
    // Logs specific to the API server
    APILogger.attachTransport((LogObj: ILogObj): void => {
        appendFileSync('APIlogs.txt', JSON.stringify(LogObj) + "\n");
    });
} else if (config.NODE_ENV == 'test') {
    log.settings.type = 'hidden';
}

export default log;

export {
    OCPPLogger,
    APILogger
};