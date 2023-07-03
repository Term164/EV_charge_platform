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

const NODE_ENV: string = checkEnvVariable(process.env.NODE_ENV, 'NODE_ENV');

// =================================== SQL connection variables =================================
let SQL_HOST: string;
let SQL_USER: string;
let SQL_PASS: string;
let SQL_DB: string;


if(NODE_ENV === 'test'){
    SQL_HOST = checkEnvVariable(process.env.SQL_HOST_TEST, 'SQL_HOST');
    SQL_USER = checkEnvVariable(process.env.SQL_USER_TEST, 'SQL_USER');
    SQL_PASS = checkEnvVariable(process.env.SQL_PASS_TEST, 'SQL_PASS');
    SQL_DB = checkEnvVariable(process.env.SQL_DB_TEST, 'SQL_DB');
}else{
    SQL_HOST = checkEnvVariable(process.env.SQL_HOST, 'SQL_HOST');
    SQL_USER = checkEnvVariable(process.env.SQL_USER, 'SQL_USER');
    SQL_PASS = checkEnvVariable(process.env.SQL_PASS, 'SQL_PASS');
    SQL_DB = checkEnvVariable(process.env.SQL_DB, 'SQL_DB');
}

// ================================== LOGGER ===========================================
const LOG_LEVEL: number = checkEnvVariableIsNumber(process.env.LOG_LEVEL, 'LOG_LEVEL', 0);

// ================================== OTHER ===============================================
const PORT: number =  checkEnvVariableIsNumber(process.env.PORT, 'PORT' , 4200);

export default {
    SQL_HOST,
    SQL_USER,
    SQL_PASS,
    SQL_DB,
    PORT,
    NODE_ENV,
    LOG_LEVEL
};

