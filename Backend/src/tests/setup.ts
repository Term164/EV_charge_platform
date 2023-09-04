import database from "../utils/database";

beforeAll( async () => {
    await database.establishDBConnection();
});

afterAll(async () => {
    await database.closeDBConnection();
});