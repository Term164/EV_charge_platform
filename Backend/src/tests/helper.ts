import { agent as _request } from "supertest";
import database from "../utils/database";
import app from "../app";

export const request = _request(app);

// ============================== CLEAR TALBES ================================

async function clearAllTables() {
    // ! The order of table deletion matters so do not change the order unless you know what you are doing!
    await database.connection.execute(
        `
        DELETE FROM sessions;
        DELETE FROM registration_secrets;
        DELETE FROM building_admins;
        DELETE FROM building_accesses;
        DELETE FROM company_admins;
        DELETE FROM buildings;
        DELETE FROM reservations;
        DELETE FROM charging_stations;
        DELETE FROM accounts;
        DELETE FROM companies;
        `
    );
}

// ============================== RETRIEVE SPECIFIC DATA ==============================

async function getNumberOfAccounts(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM accounts`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getNumberOfTokens(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM registration_secrets`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getNumberOfSessions(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM sessions`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getNumberOfBuildingAdmins(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM building_admins`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getNumberOfCompanyAdmins(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM company_admins`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getNumberOfBuildingAccesses(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM building_accesses`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getNumberOfCompanies(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM Companies`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function checkCompanyExists(companyName: string) {
    return (await database.connection.execute(`SELECT * FROM Companies WHERE company_name = '${companyName}'`)).results.at(0)?.rows?.length as number > 0;
}

async function checkUserExists(username: string) {
    const result = await database.connection.execute(`SELECT id FROM accounts WHERE username = '${username}'`);
    return result.results.at(0)?.rows?.length as number > 0;
}


async function getValidationURL(username: string): Promise<string> {
    const result = (await database.connection.execute(`
    SELECT accounts.id, registration_secret
    FROM accounts
    LEFT JOIN registration_secrets
    ON accounts.id = registration_secrets.account_id
    WHERE username = '${username}'`)).results.at(0);
    return `/api/v1/auth/register/step2/${result?.rows?.at(0)[0]}/${result?.rows?.at(0)[1]}`;
}

async function getAccountValidatedParameter(username: string): Promise<string> {
    return (await database.connection.execute(`SELECT validated FROM accounts WHERE username = '${username}'`)).results.at(0)?.rows?.at(0)[0] as string;
}
async function getSessionExpirationDate(sessionSecret: string) {
    return (await database.connection.execute(`SELECT expiration_time FROM sessions WHERE session_secret = '${sessionSecret}'`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getUserAssignedCompanyID(userID: string): Promise<number> {
    return (await database.connection.execute(`SELECT company_id FROM accounts WHERE id = '${userID}'`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getCompanyName(id: number): Promise<string> {
    return (await database.connection.execute(`SELECT "company_name" FROM Companies WHERE ID = '${id}';`)).results.at(0)?.rows?.at(0)[0] as string;
}

// ============================ MODIFY DATA ===========================

async function makeSessionExpired(sessionSecret: string) {
    await database.connection.execute(`UPDATE Sessions SET expiration_time = NOW() - interval '60 minutes' WHERE session_secret = '${sessionSecret}'`);
}

// This example data was already inserted into the database and will currently not change
function createExampleBuildings() {
    void database.connection.execute(`INSERT INTO Buildings ("building_name", "building_location") VALUES
    ('TEHNOLOŠKI PARK - STAVBA G', 'Večna pot 150'),
    ('A1 poslovna stavba', 'Ameriška ulica 4'),
    ('A1 Maribor','Mariborska cesta');`);
}

async function createExampleCompanies() {
    await database.connection.execute(`INSERT INTO Companies ("company_name") VALUES
    ('XLAB'),
    ('A1'),
    ('Lenovo');`);
}

async function insertDummyCompanyReturningID(): Promise<number> {
    return (await database.connection.execute(`INSERT INTO Companies ("company_name") VALUES ('dummy') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummySession(accountID: number, sessionID: string) {
    await database.connection.execute(`INSERT INTO Sessions ("account_id", "session_secret", "expiration_time")
    VALUES ('${accountID}', '${sessionID}', NOW() + interval '30 minutes');`);
}

async function insertDummyBuildingReturningID(): Promise<number> {
    return (await database.connection.execute(`INSERT INTO Buildings ("building_name", "building_location") VALUES ('dummy', 'location') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummyCompanyAdminReturningID(userID: string, companyID: string): Promise<number> {
    return (await database.connection.execute(`INSERT INTO company_admins ("account_id", "company_id") VALUES ('${userID}', '${companyID}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertNewUserReturningUserID(username: string, password: string, email: string): Promise<string>  {
    return (await database.connection.execute(`INSERT INTO Accounts ("username","password_hash","email_account") VALUES('${username}', '${password}','${email}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as string;
}

async function insertNewUserReturningNumberOfUsers(username: string, password: string, email: string): Promise<number>  {
    return (await database.connection.execute(`INSERT INTO Accounts ("username","password_hash","email_account") VALUES
    ('${username}', '${password}','${email}'); SELECT COUNT(*) from accounts;`)).results.at(1)?.rows?.at(0)[0] as number;
}

export default {
    clearAllTables,
    getNumberOfAccounts,
    getNumberOfTokens,
    getNumberOfSessions,
    getNumberOfBuildingAdmins,
    getNumberOfCompanyAdmins,
    getNumberOfCompanies,
    getNumberOfBuildingAccesses,
    getValidationURL,
    getAccountValidatedParameter,
    getUserAssignedCompanyID,
    checkCompanyExists,
    checkUserExists,
    makeSessionExpired,
    createExampleBuildings,
    createExampleCompanies,
    getSessionExpirationDate,
    insertDummyCompanyReturningID,
    getCompanyName,
    insertDummyBuildingReturningID,
    insertDummyCompanyAdminReturningID,
    insertNewUserReturningNumberOfUsers,
    insertNewUserReturningUserID,
    insertDummySession
};