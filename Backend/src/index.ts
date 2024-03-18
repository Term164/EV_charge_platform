import config from './utils/config';
import app from './app';
import { APILogger } from './utils/logger';
import db from './utils/database';
import {startOCPP} from './Ocpp-Central/CentralSystem';
import * as cron from './utils/cronjobs';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path'


import { SQLStatementManager } from "./utils/SQLStatementManager";

const startApplication = async () => {                                                                                                                                                                                                                                                                                                                                        await db.establishDBConnection();
    await SQLStatementManager.init();                                                                                                                                                                                                                                                                                                                                         cron.startCronJobs();
    await startOCPP(config.OCPP_PORT);                                                                                                                                                                                                                                                                                                                                        const options = {                                                                                                                                                                        key: fs.readFileSync(path.join(__dirname, "localhost-key.pem")),                                                                                                                     cert: fs.readFileSync(path.join(__dirname, "localhost.pem")),                                                                                                                      };                                                                                                                                                                                                                                                                                                                                                                      const server = https.createServer(options, app);                                                                                                                                                                                                                                                                                                                          server.listen(config.API_PORT, () => {                                                                                                                                                   APILogger.info(`Server running on port ${config.API_PORT}`);
    });
};

void startApplication();
