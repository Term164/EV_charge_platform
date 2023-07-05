import { Logger, ILogObj } from 'tslog';
import config from './config';
import { appendFileSync } from 'fs';


const log: Logger<ILogObj> = new Logger({name: "MainLogger", minLevel: config.LOG_LEVEL});


// TODO: Change the stdout to file on prodcution... check ts-log documentation

if (config.NODE_ENV == 'production'){
    log.settings.hideLogPositionForProduction = true;
    log.attachTransport((logObj: ILogObj): void => {
        appendFileSync('logs.txt', JSON.stringify(logObj) + "\n");
    });
} else if (config.NODE_ENV == 'test'){
    log.settings.type = 'hidden';
}

export default log;