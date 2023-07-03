import { agent as _request } from "supertest";
import database from "../utils/database";
import app from "../app";

export const request = _request(app);

async function clearAccountsTable() {
    await database.connection.query(
        `DELETE FROM accounts`
    );
}

export default { clearAccountsTable };