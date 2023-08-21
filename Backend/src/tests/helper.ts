import { agent as _request } from "supertest";
import database from "../utils/database";
import app from "../app";

export const request = _request(app);


// ============================== CLEAR TALBES ================================

async function clearAccountsTable() {
    await database.connection.query(
        `DELETE FROM accounts`
    );
}

async function clearRegistrationSecretsTable() {
    await database.connection.query(
        `DELETE FROM registration_secrets`
    );
}

async function clearSessionsTable() {
    await database.connection.query(
        `DELETE FROM sessions`
    );
}

async function clearBuildingAdminsTable() {
    await database.connection.query(
        `DELETE FROM building_admins`
    );
}

async function clearCompanyAdminsTable() {
    await database.connection.query(
        `DELETE FROM company_admins`
    );
}

async function clearBuildingsTable() {
    await database.connection.query(
        `DELETE FROM buildings`
    );
}

async function clearCompaniesTable() {
    await database.connection.query(
        `DELETE FROM companies`
    );
}

// ============================== RETRIEVE SPECIFIC DATA ==============================

async function getNumberOfAccounts(): Promise<number> {
    return (await database.connection.query(`SELECT COUNT(*) FROM accounts`)).rows?.at(0)[0] as number;
}

async function getNumberOfTokens(): Promise<number> {
    return (await database.connection.query(`SELECT COUNT(*) FROM registration_secrets`)).rows?.at(0)[0] as number;
}

async function getNumberOfSessions(): Promise<number> {
    return (await database.connection.query(`SELECT COUNT(*) FROM sessions`)).rows?.at(0)[0] as number;
}

async function getNumberOfBuildingAdmins(): Promise<number> {
    return (await database.connection.query(`SELECT COUNT(*) FROM building_admins`)).rows?.at(0)[0] as number;
}

async function getNumberOfCompanyAdmins(): Promise<number> {
    return (await database.connection.query(`SELECT COUNT(*) FROM company_admins`)).rows?.at(0)[0] as number;
}

async function getNumberOfCompanies(): Promise<number> {
    return (await database.connection.query(`SELECT COUNT(*) FROM Companies`)).rows?.at(0)[0] as number;
}

async function getValidationURL(username: string): Promise<string> {
    const result = await database.connection.query(`SELECT id FROM accounts WHERE username = '${username}'`);
    const token = await database.connection.query(`SELECT registration_secret FROM registration_secrets where account_id = ${result.rows?.at(0)[0]}`);
    return `/api/v1/auth/register/step2/${result.rows?.at(0)[0]}/${token.rows?.at(0)[0]}`;
}

async function getAccountValidatedParameter(username: string): Promise<string> {
    return (await database.connection.query(`SELECT validated FROM accounts WHERE username = '${username}'`)).rows?.at(0)[0] as string;
}
async function getSessionExpirationDate(sessionSecret: string) {
    return (await database.connection.query(`SELECT expiration_time FROM sessions WHERE session_secret = '${sessionSecret}'`)).rows?.at(0)[0] as number;
}

// ============================ MODIFY DATA ===========================

async function makeSessionExpired(sessionSecret: string) {
    await database.connection.query(`UPDATE Sessions SET expiration_time = NOW() - interval '60 minutes' WHERE session_secret = '${sessionSecret}'`);
}

function createExampleBuildings() {
    void database.connection.query(`INSERT INTO Buildings ("building_name", "building_location") VALUES
    ('TEHNOLOŠKI PARK - STAVBA G', 'Večna pot 150'),
    ('A1 poslovna stavba', 'Ameriška ulica 4'),
    ('A1 Maribor','Mariborska cesta');`);
}

function createExampleCompanies() {
    void database.connection.query(`INSERT INTO Companies ("company_name") VALUES
    ('XLAB'),
    ('A1'),
    ('Lenovo');`);
}

async function insertDummyCompanyReturningID(): Promise<number> {
    return (await database.connection.query(`INSERT INTO Companies ("company_name") VALUES ('dummy') RETURNING ID;`)).rows?.at(0)[0] as number;
}

async function getCompanyName(id: number): Promise<string> {
    return (await database.connection.query(`SELECT "company_name" FROM Companies WHERE ID = '${id}';`)).rows?.at(0)[0] as string;
}

export default {
    clearAccountsTable,
    clearRegistrationSecretsTable,
    clearSessionsTable,
    clearBuildingAdminsTable,
    clearCompanyAdminsTable,
    clearBuildingsTable,
    clearCompaniesTable,
    getNumberOfAccounts,
    getNumberOfTokens,
    getNumberOfSessions,
    getNumberOfBuildingAdmins,
    getNumberOfCompanyAdmins,
    getNumberOfCompanies,
    getValidationURL,
    getAccountValidatedParameter,
    makeSessionExpired,
    createExampleBuildings,
    createExampleCompanies,
    getSessionExpirationDate,
    insertDummyCompanyReturningID,
    getCompanyName
};