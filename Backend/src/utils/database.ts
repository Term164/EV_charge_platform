import { Connection } from "postgresql-client";
import log from "./logger";
import config from "./config";
import { exit } from "process";

const connection = new Connection({
    host: config.SQL_HOST,
    user: config.SQL_USER,
    password: config.SQL_PASS,
    database: config.SQL_DB,
    ssl: {}
});

async function establishDBConnection() {
    log.info(`Establishing connection to ${config.SQL_HOST}.`);
    await connection.connect()
        .then(() => {log.info(`Connection to database ${config.SQL_DB} established.`);})
        .catch(() => {log.fatal(`Connection to database "${config.SQL_HOST}" could not be established.`);exit();});
}

async function closeDBConnection() {
    log.info(`Closing connection to ${config.SQL_DB}`);
    await connection.close()
        .then(() => {log.info(`Connection to database ${config.SQL_DB} succesfully closed.`);})
        .catch(() => {log.error(`An error occured while trying to close database connection to ${config.SQL_DB}`);});
}


export default {
    connection,
    establishDBConnection,
    closeDBConnection
};