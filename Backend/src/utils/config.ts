import 'dotenv/config';
import { Logger, ILogObj } from 'tslog';
import { exit } from 'process';

const log: Logger<ILogObj> = new Logger({name: "configLogger"});

// =================================== Type Guards ==================================
const checkEnvVariable = (variable: unknown, variableName: string): string => {
    if(!variable || !(typeof variable === 'string')){
        log.fatal(new Error(`Enviromental variable ${variableName} is not set.`));
        exit();
    }

    return variable;
};

const checkEnvVariableIsNumber = (variable: unknown, variableName: string, defaultValue: number): number => {

    if(!variable || isNaN(Number(variable))){
        log.warn(`Enviromental variable ${variableName} is not set or is not a number, defaulting to ${defaultValue}.`);
        return defaultValue;
    }


    return variable as number;
};


// =================================== SQL connection variables =================================
const SQL_HOST: string = checkEnvVariable(process.env.SQL_HOST, 'SQL_HOST');
const SQL_USER: string = checkEnvVariable(process.env.SQL_USER, 'SQL_USER');
const SQL_PASS: string = checkEnvVariable(process.env.SQL_PASS, 'SQL_PASS');
const SQL_DB: string = checkEnvVariable(process.env.SQL_DB, 'SQL_DB');
const PORT: number =  checkEnvVariableIsNumber(process.env.PORT, 'PORT' , 4200);

// ================================== LOGGER ===========================================
const LOG_LEVEL: number = checkEnvVariableIsNumber(process.env.LOG_LEVEL, 'LOG_LEVEL', 0);
// ================================== OTHER ===============================================
const NODE_ENV: string = checkEnvVariable(process.env.NODE_ENV, 'NODE_ENV');

export default {
    SQL_HOST,
    SQL_USER,
    SQL_PASS,
    SQL_DB,
    PORT,
    NODE_ENV,
    LOG_LEVEL
};

