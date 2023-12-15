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
        DELETE FROM charging_connectors;
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

async function clearStationsAndConnectors() {
    await database.connection.execute(`
    DELETE FROM charging_connectors;
    DELETE FROM charging_stations;`
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

async function checkCAdminExists(companyAdminID : number) {
    const result = await database.connection.execute(`SELECT company_id FROM company_admins WHERE account_id = '${companyAdminID}'`);
    return result.results.at(0)?.rows?.length as number > 0;
}

async function checkBAdminExists(buildingAdminID : number) {
    const result = await database.connection.execute(`SELECT building_id FROM building_admins WHERE account_id = '${buildingAdminID}'`);
    return result.results.at(0)?.rows?.length as number > 0;
}

async function checkUserHasBuildingAccess(userID: number, buildingID: number) {
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

async function getUserAssignedCompanyID(userID: number): Promise<number> {
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

async function checkChargingConnectorExists(stationID: number, serialNumber: number): Promise<boolean> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM charging_connectors WHERE charging_station_id = '${stationID}' AND serial_number = '${serialNumber}' ;`)).results.at(0)?.rows?.length as number > 0;
}

async function checkChargingStationExists(chargingStationName: string): Promise<boolean> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM charging_stations WHERE name = '${chargingStationName}';`)).results.at(0)?.rows?.length as number > 0;
}

async function getNumberOfChargingStations(): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM charging_stations`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getNumberOfChargingConnectors(stationID: number): Promise<number> {
    return (await database.connection.execute(`SELECT COUNT(*) FROM charging_connectors WHERE charging_station_id = '${stationID}';`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getChargingStationIDFromName(stationName: string): Promise<number> {
    return (await database.connection.execute(`SELECT "id" FROM charging_stations WHERE name = '${stationName}';`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function getChargingStationData(id: number): Promise<string[]> {
    return (await database.connection.execute(`SELECT "building_id","name" FROM charging_stations WHERE ID = '${id}';`)).results.at(0)?.rows?.at(0) as string[];
}

async function getChargingConnectorData(id: number): Promise<string[]> {
    return (await database.connection.execute(`SELECT "charging_type_id","serial_number" FROM charging_connectors WHERE ID = '${id}';`)).results.at(0)?.rows?.at(0) as string[];
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

async function assignCompanyToBuilding(companyID: number, buildingID: number) {
    return (await database.connection.execute( `INSERT INTO "Building-Company" ("building_id", "company_id") VALUES (${buildingID}, ${companyID});`));
}

async function insertDummyCompanyAdminReturningID(userID: number, companyID: number): Promise<number> {
    return (await database.connection.execute(`INSERT INTO company_admins ("account_id", "company_id") VALUES ('${userID}', '${companyID}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummyBuildingAdminReturningID(userID: number, buildingID: number): Promise<number> {
    return (await database.connection.execute(`INSERT INTO building_admins ("account_id", "building_id") VALUES ('${userID}', '${buildingID}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertNewUserReturningUserID(username: string, password: string, email: string): Promise<number>  {
    return Number.parseInt((await database.connection.execute(`INSERT INTO Accounts ("username","password_hash","email_account") VALUES('${username}', '${password}','${email}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as string);
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

async function insertDummyChargingStationReturningID(buildingID: number, stationName: string): Promise<number> {
    return (await database.connection.execute(`INSERT INTO charging_stations ("building_id", "name") VALUES ('${buildingID}', '${stationName}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummyChargingConnectorReturningID(stationID: number, typeID: number, serialNumber: number) {
    return (await database.connection.execute(`INSERT INTO charging_connectors ("charging_station_id", "charging_type_id", "serial_number") VALUES ('${stationID}','${typeID}', '${serialNumber}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}

async function insertDummyChargingStationWithOneConnectorReturningID(buildingID: number, stationName: string, typeID: number): Promise<number> {
    const stationID = (await database.connection.execute(`INSERT INTO charging_stations ("building_id", "name") VALUES ('${buildingID}', '${stationName}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
    await database.connection.execute(`INSERT INTO charging_connectors ("charging_station_id", "charging_type_id", "serial_number") VALUES ('${stationID}','${typeID}', 1);`);
    return stationID;
}

async function insertDummyChargingStationWithTwoConnectorsReturningID(buildingID: number, stationName: string, typeID: number): Promise<number> {
    const stationID = (await database.connection.execute(`INSERT INTO charging_stations ("building_id", "name") VALUES ('${buildingID}', '${stationName}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
    await database.connection.execute(`INSERT INTO charging_connectors ("charging_station_id", "charging_type_id", "serial_number") VALUES ('${stationID}','${typeID}', 1);`);
    await database.connection.execute(`INSERT INTO charging_connectors ("charging_station_id", "charging_type_id", "serial_number") VALUES ('${stationID}','${typeID}', 2);`);
    return stationID;
}

async function setCompanyIDOfChargingStation(id: number, companyID: number) {
    await database.connection.execute(`UPDATE charging_stations SET "company_id" = ${companyID} WHERE ID = ${id};`);
}

async function setBuildingAccessToUser(userID: number, buildingID: number) {
    return (await database.connection.execute(`INSERT INTO building_accesses ("account_id", "building_id") VALUES ('${userID}', '${buildingID}');`));
}

async function createNewCompanyAdmin(): Promise<number> {
    const username = crypto.randomBytes(20).toString('hex');
    const password = crypto.randomBytes(20).toString('hex');
    const email = crypto.randomBytes(20).toString('hex');

    const userID = await insertNewUserReturningUserID(username,password,email);
    const companyID = await insertDummyCompanyReturningID(crypto.randomBytes(20).toString('hex'));
    void await insertDummyCompanyAdminReturningID(userID, companyID);
    return userID;
}

async function createNewBuildingAdmin(): Promise<number> {
    const username = crypto.randomBytes(20).toString('hex');
    const password = crypto.randomBytes(20).toString('hex');
    const email = crypto.randomBytes(20).toString('hex');

    const userID = await insertNewUserReturningUserID(username,password,email);
    const buildingID = await insertDummyBuildingReturningID(crypto.randomBytes(20).toString('hex'));
    void await insertDummyBuildingAdminReturningID(userID, buildingID);
    return userID;
}

async function insertUserBuildingAccess(userID: number, buildingID: number, companyAdminID: number) {
    return (await database.connection.execute(`INSERT INTO building_accesses ("account_id", "building_id", "company_admin_id") VALUES ('${userID}', '${buildingID}', '${companyAdminID}') RETURNING ID;`)).results.at(0)?.rows?.at(0)[0] as number;
}


export default {
    clearAllTables,
    clearStationsAndConnectors,
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
    insertDummyUserWithCompanyReturningID,
    insertDummySession,
    checkChargingTypeExists,
    getNumberOfChargingTypes,
    insertDummyChargingTypeReturningID,
    getChargingType,
    checkChargingStationExists,
    checkChargingConnectorExists,
    getNumberOfChargingStations,
    getNumberOfChargingConnectors,
    insertDummyChargingStationReturningID,
    insertDummyChargingConnectorReturningID,
    insertDummyChargingStationWithOneConnectorReturningID,
    insertDummyChargingStationWithTwoConnectorsReturningID,
    getChargingStationData,
    getChargingStationIDFromName,
    getChargingConnectorData,
    getCompanyIDOfChargingStation,
    setCompanyIDOfChargingStation,
    assignCompanyToBuilding,
    setBuildingAccessToUser,
    createNewCompanyAdmin,
    createNewBuildingAdmin,
    insertUserBuildingAccess,
};