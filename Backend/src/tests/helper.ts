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
        DELETE FROM charging_stations;
        DELETE FROM charging_types;
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

async function getNumberOfBuildings(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM Buildings`)).results.at(0)?.rows?.at(0)[0] as number;
}

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

async function checkChargingTypeExists(chargingType: string) {
    return (await database.connection.execute(`SELECT COUNT(*) FROM charging_types WHERE type = '${chargingType}';`)).results.at(0)?.rows?.length as number > 0;
}

async function getNumberOfChargingTypes(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM charging_types;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getChargingType(id: number): Promise<string> {
    return (await database.connection.execute(`SELECT "type" FROM charging_types WHERE ID = '${id}';`)).results.at(0)?.rows?.at(0)[0] as string;
}

async function checkChargingStationExists(chargingStationName: string): Promise<boolean> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM charging_stations WHERE name = '${chargingStationName}';`)).results.at(0)?.rows?.length as number > 0;
}

async function getNumberOfChargingStations(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM charging_stations`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getChargingStationData(id: number): Promise<string[]> {
    return (await database.connection.execute(`SELECT "charging_type_id","building_id","name" FROM charging_stations WHERE ID = '${id}';`)).results.at(0)?.rows?.at(0) as string[];
}

async function getCompanyIDOfChargingStation(id: number): Promise<number|null> {
    // Result is either a number or an intentional null, which this can't handle??
    const result = (await database.connection.execute(`SELECT "company_id" FROM charging_stations WHERE ID = ${id};`)).results.at(0)?.rows?.at(0) as number[] | undefined;
    if (result == undefined)
        return null;
    return result[0];
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

/** Inserts a dummy company with the name 'dummy'*/
async function insertDummyCompanyReturningID(): Promise<number> {
    return (await database.connection.execute(`INSERT INTO Companies ("company_name") VALUES ('dummy') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummySession(accountID: number, sessionID: string) {
    await database.connection.execute(`INSERT INTO Sessions ("account_id", "session_secret", "expiration_time")
    VALUES ('${accountID}', '${sessionID}', NOW() + interval '30 minutes');`);
}

/** Inserts a dummy building with the name 'dummy' and location 'location'*/
async function insertDummyBuildingReturningID(): Promise<number> {
    return (await database.connection.execute(`INSERT INTO Buildings ("building_name", "building_location") VALUES ('dummy', 'location') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

/** Inserts 3 new dummy companies, assigns them to a given building */
async function insertCompaniesAssignedToBuilding(buildingID: number) {
    return (await database.connection.execute(`INSERT INTO "Building-Company" ("building_id", "company_id") 
    VALUES (${buildingID}, ${await insertDummyCompanyReturningID()}), (${buildingID}, ${await insertDummyCompanyReturningID()}), (${buildingID}, ${await insertDummyCompanyReturningID()})`));
}

/** Inserts 3 new dummy buildings, assigns them to a given company */
async function insertBuildingsOwnedByCompany(companyID: number) {
    return (await database.connection.execute(`INSERT INTO "Building-Company" ("building_id", "company_id") 
    VALUES (${await insertDummyBuildingReturningID()}, ${companyID}), (${await insertDummyBuildingReturningID()}, ${companyID}), (${await insertDummyBuildingReturningID()}, ${companyID})`));
}

async function assignCompanyToBuilding(companyID: number, buildingID: number) {
    return (await database.connection.execute( `INSERT INTO "Building-Company" ("building_id", "company_id") VALUES (${buildingID}, ${companyID});`));
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

async function insertDummyUserWithCompanyReturningID(companyID: number | null): Promise<number>  {
    return (await database.connection.execute(`INSERT INTO Accounts ("username","password_hash","email_account","company_id") VALUES
    ('dummy-test', 'dummy-test','dummy-test', ${companyID}) RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummyChargingTypeReturningID(): Promise<number> {
    return (await database.connection.execute(`INSERT INTO charging_types ("type") VALUES ('dummy-test') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummyChargingStationReturningID(chargingTypeID: number, buildingID: number): Promise<number> {
    return (await database.connection.execute(`INSERT INTO charging_stations ("charging_type_id", "building_id", "name") VALUES ('${chargingTypeID}', '${buildingID}', 'station-test') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function setCompanyIDOfChargingStation(id: number, companyID: number) {
    await database.connection.execute(`UPDATE charging_stations SET "company_id" = ${companyID} WHERE ID = ${id};`);
}

async function setBuildingAccessToUser(userID: number, buildingID: number) {
    return (await database.connection.execute(`INSERT INTO building_accesses ("account_id", "building_id") VALUES ('${userID}', '${buildingID}');`));
}

export default {
    clearAllTables,
    getNumberOfAccounts,
    getNumberOfTokens,
    getNumberOfSessions,
    getNumberOfBuildingAdmins,
    getNumberOfCompanyAdmins,
    getNumberOfCompanies,
    getNumberOfBuildings,
    getNumberOfBuildingAccesses,
    getValidationURL,
    getAccountValidatedParameter,
    getUserAssignedCompanyID,
    checkCompanyExists,
    checkBuildingExists,
    checkCompanyAssignedToBuildingExists,
    checkUserExists,
    makeSessionExpired,
    createExampleBuildings,
    createExampleCompanies,
    getSessionExpirationDate,
    insertDummyCompanyReturningID,
    getCompanyName,
    getBuildingData,
    insertDummyBuildingReturningID,
    insertCompaniesAssignedToBuilding,
    insertBuildingsOwnedByCompany,
    insertDummyCompanyAdminReturningID,
    insertNewUserReturningNumberOfUsers,
    insertNewUserReturningUserID,
    insertDummyUserWithCompanyReturningID,
    insertDummySession,
    checkChargingTypeExists,
    getNumberOfChargingTypes,
    insertDummyChargingTypeReturningID,
    getChargingType,
    checkChargingStationExists,
    getNumberOfChargingStations,
    insertDummyChargingStationReturningID,
    getChargingStationData,
    getCompanyIDOfChargingStation,
    setCompanyIDOfChargingStation,
    assignCompanyToBuilding,
    setBuildingAccessToUser,
};