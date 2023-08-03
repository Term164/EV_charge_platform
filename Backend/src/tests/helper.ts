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

export default {
    clearAccountsTable,
    clearRegistrationSecretsTable,
    clearSessionsTable,
    getNumberOfAccounts,
    getNumberOfTokens,
    getNumberOfSessions,
    getValidationURL,
    getAccountValidatedParameter,
    makeSessionExpired,
    getSessionExpirationDate
};