import config from './utils/config';
import app from './app';
import log from './utils/logger';
import db from './utils/database';

const startApplication = async () => {
    await db.establishDBConnection();
    app.listen(config.PORT, () => {
        log.info(`Server running on port ${config.PORT}`);
    });
};

void startApplication();

