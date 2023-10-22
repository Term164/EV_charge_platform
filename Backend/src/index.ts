import config from './utils/config';
import app from './app';
import log from './utils/logger';
import db from './utils/database';
import { SQLStatementManager } from "./utils/SQLStatementManager";

const startApplication = async () => {
    await db.establishDBConnection();
    await SQLStatementManager.init();
    app.listen(config.PORT, () => {
        log.info(`Server running on port ${config.PORT}`);
    });
};

void startApplication();

