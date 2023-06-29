import 'dotenv/config';

const SQL_HOST: string = process.env.SQL_HOST || 'no_host_in_env_file';
const SQL_USER: string = process.env.SQL_USER || 'no_user_in_env_file';
const SQL_PASS: string = process.env.SQL_PASS || 'no_password_in_env_file';
const SQL_DB: string = process.env.SQL_DB || 'no_database_in_env_file';
const PORT: string = process.env.PORT || '4200';

export default {
    SQL_HOST,
    SQL_USER,
    SQL_PASS,
    SQL_DB,
    PORT
};