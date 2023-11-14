import database from "../utils/database";
import { SQLStatementManager } from "../utils/SQLStatementManager";

beforeAll( async () => {
    await database.establishDBConnection();
    await SQLStatementManager.init();
}, 10000);

afterAll(async () => {
    await database.closeDBConnection();
});