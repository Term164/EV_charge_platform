import { Logger, ILogObj } from 'tslog';
import config from './config';
import { appendFileSync } from 'fs';

const log: Logger<ILogObj> = new Logger({name: "MainLogger", minLevel: config.LOG_LEVEL});

if (config.NODE_ENV == 'production'){
    log.attachTransport((logObj: ILogObj): void => {
        appendFileSync('logs.txt', JSON.stringify(logObj) + "\n");
    });
}

export default log;