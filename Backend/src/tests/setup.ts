import database from "../utils/database";
import { SQLStatementManager } from "../utils/SQLStatementManager";

beforeAll( async () => {
    await database.establishDBConnection();
    await SQLStatementManager.init();
});

afterAll(async () => {
    await database.closeDBConnection();
});