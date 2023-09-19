import { agent as _request } from "supertest";
import database from "../utils/database";
import app from "../app";
import crypto from 'crypto';

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
        DELETE FROM "Building-Company";
        DELETE FROM buildings;
        DELETE FROM reservations;
        DELETE FROM charging_stations;
        DELETE FROM accounts;
        DELETE FROM companies;
        `
    );
}

// ============================== RETRIEVE SPECIFIC DATA ==============================

async function checkCompanyExists(companyName: string) {
    return (await database.connection.execute(`SELECT * FROM Companies WHERE company_name = '${companyName}'`)).results.at(0)?.rows?.length as number > 0;
}

async function checkBuildingExists(buildingName: string) {
    return (await database.connection.execute(`SELECT * FROM Buildings WHERE building_name = '${buildingName}'`)).results.at(0)?.rows?.length as number > 0;
}

async function checkCompanyAssignedToBuildingExists(buildingID: number, companyID: number) {
    return (await database.connection.execute(`SELECT COUNT(*) FROM "Building-Company" WHERE building_id = '${buildingID}' AND company_id = '${companyID}'`)).results.at(0)?.rows?.length as number == 1;
}

async function checkUserExists(username: string) {
    const result = await database.connection.execute(`SELECT id FROM accounts WHERE username = '${username}'`);
    return result.results.at(0)?.rows?.length as number > 0;
}

async function checkCAdminExists(companyAdminID : string) {
    const result = await database.connection.execute(`SELECT company_id FROM company_admins WHERE account_id = '${companyAdminID}'`);
    return result.results.at(0)?.rows?.length as number > 0;
}

async function checkBAdminExists(buildingAdminID : string) {
    const result = await database.connection.execute(`SELECT building_id FROM building_admins WHERE account_id = '${buildingAdminID}'`);
    return result.results.at(0)?.rows?.length as number > 0;
}

async function checkUserHasBuildingAccess(userID: string, buildingID: string) {
    const result = await database.connection.execute(`SELECT id FROM building_accesses WHERE account_id = '${userID}' AND building_id = '${buildingID}'`);
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

async function getBuildingData(id: number): Promise<string[]> {
    return (await database.connection.execute(`SELECT "building_name","building_location" FROM Buildings WHERE ID = '${id}';`)).results.at(0)?.rows?.at(0) as string[];
}

// ============================ MODIFY DATA ===========================

async function makeSessionExpired(sessionSecret: string) {
    await database.connection.execute(`UPDATE Sessions SET expiration_time = NOW() - interval '60 minutes' WHERE session_secret = '${sessionSecret}'`);
}

// This example data was already inserted into the database and will currently not change
async function createExampleBuildings() {
    await database.connection.execute(`INSERT INTO Buildings ("building_name", "building_location") VALUES
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

async function insertDummyCompanyReturningID(companyName: string): Promise<number> {
    return (await database.connection.execute(`INSERT INTO Companies ("company_name") VALUES ('${companyName}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummySession(accountID: number, sessionID: string) {
    await database.connection.execute(`INSERT INTO Sessions ("account_id", "session_secret", "expiration_time")
    VALUES ('${accountID}', '${sessionID}', NOW() + interval '30 minutes');`);
}

async function insertDummyBuildingReturningID(buildingName: string): Promise<number> {
    return (await database.connection.execute(`INSERT INTO Buildings ("building_name", "building_location") VALUES ('${buildingName}', 'location') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

/** Inserts 3 new dummy companies, assigns them to a given building */
async function insertCompaniesAssignedToBuilding(buildingID: number) {
    return (await database.connection.execute(`INSERT INTO "Building-Company" ("building_id", "company_id") 
    VALUES (${buildingID}, ${await insertDummyCompanyReturningID('dummy1')}), (${buildingID}, ${await insertDummyCompanyReturningID('dummy2')}), (${buildingID}, ${await insertDummyCompanyReturningID('dummy3')})`));
}

/** Inserts 3 new dummy buildings, assigns them to a given company */
async function insertBuildingsOwnedByCompany(companyID: number) {
    return (await database.connection.execute(`INSERT INTO "Building-Company" ("building_id", "company_id") 
    VALUES (${await insertDummyBuildingReturningID('dummy1')}, ${companyID}), (${await insertDummyBuildingReturningID('dummy2')}, ${companyID}), (${await insertDummyBuildingReturningID('dummy3')}, ${companyID})`));
}

async function insertDummyCompanyAdminReturningID(userID: string, companyID: string): Promise<number> {
    return (await database.connection.execute(`INSERT INTO company_admins ("account_id", "company_id") VALUES ('${userID}', '${companyID}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummyBuildingAdminReturningID(userID: string, buildingID: string): Promise<number> {
    return (await database.connection.execute(`INSERT INTO building_admins ("account_id", "building_id") VALUES ('${userID}', '${buildingID}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertNewUserReturningUserID(username: string, password: string, email: string): Promise<string>  {
    return (await database.connection.execute(`INSERT INTO Accounts ("username","password_hash","email_account") VALUES('${username}', '${password}','${email}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as string;
}

async function insertNewUserReturningNumberOfUsers(username: string, password: string, email: string): Promise<number>  {
    return (await database.connection.execute(`INSERT INTO Accounts ("username","password_hash","email_account") VALUES
    ('${username}', '${password}','${email}'); SELECT COUNT(*) from accounts;`)).results.at(1)?.rows?.at(0)[0] as number;
}

async function createNewCompanyAdmin(): Promise<string> {
    const username = crypto.randomBytes(20).toString('hex');
    const password = crypto.randomBytes(20).toString('hex');
    const email = crypto.randomBytes(20).toString('hex');

    const userID = await insertNewUserReturningUserID(username,password,email);
    const companyID = await insertDummyCompanyReturningID(crypto.randomBytes(20).toString('hex'));
    void await insertDummyCompanyAdminReturningID(String(userID), String(companyID));
    return userID;
}

async function createNewBuildingAdmin(): Promise<string> {
    const username = crypto.randomBytes(20).toString('hex');
    const password = crypto.randomBytes(20).toString('hex');
    const email = crypto.randomBytes(20).toString('hex');

    const userID = await insertNewUserReturningUserID(username,password,email);
    const buildingID = await insertDummyBuildingReturningID(crypto.randomBytes(20).toString('hex'));
    void await insertDummyBuildingAdminReturningID(String(userID), String(buildingID));
    return userID;
}


async function insertUserBuildingAccess(userID: string, buildingID: string, companyAdminID: string) {
    return (await database.connection.execute(`INSERT INTO building_accesses ("account_id", "building_id", "company_admin_id") VALUES ('${userID}', '${buildingID}', '${companyAdminID}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}


export default {
    clearAllTables,
    getValidationURL,
    getAccountValidatedParameter,
    getUserAssignedCompanyID,
    checkCompanyExists,
    checkBuildingExists,
    checkCompanyAssignedToBuildingExists,
    checkUserExists,
    checkCAdminExists,
    checkBAdminExists,
    checkUserHasBuildingAccess,
    makeSessionExpired,
    createExampleBuildings,
    createExampleCompanies,
    getSessionExpirationDate,
    insertDummyCompanyReturningID,
    insertDummyBuildingAdminReturningID,
    getCompanyName,
    getBuildingData,
    insertDummyBuildingReturningID,
    insertCompaniesAssignedToBuilding,
    insertBuildingsOwnedByCompany,
    insertDummyCompanyAdminReturningID,
    insertNewUserReturningNumberOfUsers,
    insertNewUserReturningUserID,
    insertDummySession,
    createNewCompanyAdmin,
    createNewBuildingAdmin,
    insertUserBuildingAccess,
};