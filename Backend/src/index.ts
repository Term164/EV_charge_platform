import app from './app';
import config from './utils/config';
import log from './utils/logger';

app.listen(config.PORT, () => {
    log.info(`Server running on port ${config.PORT}`);
});