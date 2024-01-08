import db from './database';
import { DataTypeOIDs, PreparedStatement } from "postgresql-client";
import log from './logger';

class StatmentManager {

    // Admin Service statements
    assignBadminStatement: PreparedStatement;
    assignCadminStatement: PreparedStatement;

    // Assign Employee Service statements
    assignToCompanyStatement: PreparedStatement;
    assignToBuildingStatement: PreparedStatement;

    // Auth Service statements
    saveSessionIDStatement: PreparedStatement;
    getUserDataFromEmailStatement: PreparedStatement;
    getUserDataFromUsernameStatement: PreparedStatement;
    checkEmailExists: PreparedStatement;
    createNewValidationCode: PreparedStatement;
    confirmValidationCode: PreparedStatement;
    updatePassword: PreparedStatement;

    // Building Service statements
    createBuildingStatement: PreparedStatement;
    getAllBuildingsStatement: PreparedStatement;
    deleteBuildingStatement: PreparedStatement;
    editBuildingStatement: PreparedStatement;
    getAllBuildingsByCompanyStatement: PreparedStatement;
    getAllCompaniesAssignedToBuildingStatement: PreparedStatement;
    assignCompanyStatement: PreparedStatement;

    // Company Service statements
    createCompanyStatement: PreparedStatement;
    getAllCompaniesStatment: PreparedStatement;
    deleteCompanyStatement: PreparedStatement;
    editCompanyStatement: PreparedStatement;

    // Register Service statements;
    checkUniqueUsernameStatement: PreparedStatement;
    checkUniqueEmailStatement: PreparedStatement;
    saveVerificationTokenStatement: PreparedStatement;
    getVerificationTokenStatement: PreparedStatement;
    validateUserAccountStatement: PreparedStatement;
    removeValidationTokenStatement: PreparedStatement;
    insertNewAccountStatement: PreparedStatement;

    // User Service statements;
    getBuildingAdminsStatment: PreparedStatement;
    getCompanyAdminsStatement: PreparedStatement;
    getAssignedBuildingAdminsStatement: PreparedStatement;
    getAssignedCompanyAdminsStatement: PreparedStatement;
    deleteBuildingAdminStatement: PreparedStatement;
    deleteCompanyAdminStatement: PreparedStatement;
    deleteAccountStatement: PreparedStatement;
    deleteBuildingAccessStatement: PreparedStatement;
    editUserProfileStatement: PreparedStatement;
    getUserDataStatement: PreparedStatement;

    // Middleware
    getSessionIDStatement: PreparedStatement;
    deleteSessionIDStatmenet: PreparedStatement;
    updateSessionIDStatement: PreparedStatement;
    checkAdminAuthorizationStatement: PreparedStatement;

    // Charging Station Service statements;
    createChargingStationStatement: PreparedStatement;
    createChargingConnectorStatement: PreparedStatement;
    getAllChargingStationsSpecificStatement: PreparedStatement;
    getAllChargingStationsFullStatement: PreparedStatement;
    getAvailabilityPercentageStatement: PreparedStatement;
    deleteChargingStationStatement: PreparedStatement;
    deleteChargingConnectorByStationIDStatement: PreparedStatement;
    deleteChargingConnectorStatement: PreparedStatement;
    editChargingStationStatement: PreparedStatement;
    editChargingConnectorStatement: PreparedStatement;
    assignChargingStationToCompanyStatement: PreparedStatement;
    getAllAvailableChargingStationsStatement: PreparedStatement;

    // Charging Type Service statements;
    createChargingTypeStatement: PreparedStatement;
    getAllChargingTypesStatement: PreparedStatement;
    deleteChargingTypeStatement: PreparedStatement;
    editChargingTypeStatement: PreparedStatement;

    // OCPP statements
    getAllConnectorIDStatement: PreparedStatement;
    getAllNextReservationsStatement: PreparedStatement;

    // Reservation statements
    getAllAvailableChargingTypesAtBuildingForPersonStatement: PreparedStatement;
    getAllReservationsForPersonStatement: PreparedStatement;
    getAllReservationsForBuildingStatement: PreparedStatement;
    getSpecificReservationStatement: PreparedStatement;
    createReservationStatement: PreparedStatement;
    editReservationStatement: PreparedStatement;
    cancelReservationStatement: PreparedStatement;

    // Cronjob statements - cleaning database
    deleteExpiredSessionsStatement: PreparedStatement;
    deleteExpiredRegistrationSecretsStatement: PreparedStatement;
    deleteExpiredResetPasswordSecretsStatement: PreparedStatement;
    deleteOldReservationsStatement: PreparedStatement;

    private async prepareAdminServiceStatements() {
        this.assignBadminStatement = await db.connection.prepare(
            `INSERT INTO Building_admins (account_id, building_id)
            VALUES ($1, $2)
            ON CONFLICT ON CONSTRAINT uni_building_admins_account_id_building_id DO NOTHING;`, //unique_account_building
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );

        this.assignCadminStatement = await db.connection.prepare(
            `INSERT INTO company_admins (account_id, company_id)
            VALUES ($1, $2)
            ON CONFLICT ON CONSTRAINT uni_company_admins_account_id_company_id DO NOTHING;`, //unique_account_company
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );
    }

    private async prepareAssignEmployeeServiceStatements ( ) {
        this.assignToCompanyStatement = await db.connection.prepare(
            `UPDATE accounts SET company_id = $1
            WHERE id = $2;`,
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );

        this.assignToBuildingStatement = await db.connection.prepare(
            `INSERT INTO Building_accesses (account_id, building_id, company_admin_id)
            VALUES ($1, $2, $3)
            ON CONFLICT ON CONSTRAINT uni_building_accesses_account_id_building_id DO NOTHING;;`, //unique_account_building_access
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );
    }

    private async prepareAuthServiceStatements () {
        this.saveSessionIDStatement = await db.connection.prepare(
            `INSERT INTO Sessions ("account_id", "session_secret", "expiration_time")
            VALUES ($1, $2, NOW() + interval '30 minutes');`,
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.varchar]}
        );

        this.getUserDataFromEmailStatement = await db.connection.prepare(
            `SELECT *
            FROM Accounts
            WHERE email_account = $1`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.getUserDataFromUsernameStatement = await db.connection.prepare(
            `SELECT *
            FROM Accounts
            WHERE username = $1`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.checkEmailExists = await db.connection.prepare(
            `SELECT id FROM accounts WHERE email_account = $1;`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.createNewValidationCode = await db.connection.prepare(
            `INSERT INTO reset_password_secrets ("account_id", "reset_password_secret", "expiration_time")
            VALUES ($1, $2, NOW() + interval '10 minutes');`,
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );

        this.confirmValidationCode = await db.connection.prepare(
            `SELECT reset_password_secret
            FROM reset_password_secrets
            WHERE account_id = $1
            ORDER BY expiration_time DESC
            LIMIT 1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.updatePassword = await db.connection.prepare(
            `UPDATE Accounts 
            SET password_hash = $1
            WHERE id = $2;`,
            {paramTypes: [DataTypeOIDs.varchar, DataTypeOIDs.numeric]}
        );
    }

    private async prepareBuildingServiceStatements () {
        this.createBuildingStatement = await db.connection.prepare(
            `INSERT INTO Buildings (building_name, building_location, longitude, latitude)
            VALUES ($1, $2, $3, $4);`,
            {paramTypes: [DataTypeOIDs.varchar, DataTypeOIDs.varchar, DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );

        this.getAllBuildingsStatement = await db.connection.prepare(
            `SELECT * FROM Buildings;`,
            {paramTypes: []}
        );

        this.deleteBuildingStatement = await db.connection.prepare(
            `DELETE FROM Buildings
            WHERE id = $1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.editBuildingStatement = await db.connection.prepare(
            `call edit_building($1, $2, $3, $4, $5);`,
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.varchar, DataTypeOIDs.varchar, DataTypeOIDs.float4, DataTypeOIDs.float4]}
        );

        this.getAllBuildingsByCompanyStatement = await db.connection.prepare(
            `SELECT b.id building_id, building_name, building_location
            FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id 
            JOIN Companies c ON c.id = bc.company_id
            WHERE c.id = $1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.getAllCompaniesAssignedToBuildingStatement = await db.connection.prepare(
            `SELECT c.id company_id, company_name
            FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id 
            JOIN Companies c ON c.id = bc.company_id
            WHERE b.id= $1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.assignCompanyStatement = await db.connection.prepare(
            `INSERT INTO "Building-Company" (company_id, building_id)
            VALUES ($1, $2)
            ON CONFLICT ON CONSTRAINT uni_building_company_building_id_company_id DO NOTHING;`, //unique_building_company
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );
    }

    private async prepareCompanyServiceStatements () {
        this.createCompanyStatement = await db.connection.prepare(
            `INSERT INTO Companies (company_name)
            VALUES ($1);`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.getAllCompaniesStatment = await db.connection.prepare(
            `SELECT * FROM Companies;`,
            {paramTypes: []}
        );

        this.deleteCompanyStatement = await db.connection.prepare(
            `DELETE FROM Companies
            WHERE id = $1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.editCompanyStatement = await db.connection.prepare(
            `UPDATE Companies
            SET company_name = $1
            WHERE id = $2;`,
            {paramTypes: [DataTypeOIDs.varchar, DataTypeOIDs.numeric]}
        );
    }

    private async prepareRegisterServiceStatements () {
        this.checkUniqueUsernameStatement = await db.connection.prepare(
            `SELECT id FROM Accounts
            WHERE username LIKE $1;`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.checkUniqueEmailStatement = await db.connection.prepare(
            `SELECT id FROM Accounts
            WHERE email_account LIKE $1;`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.saveVerificationTokenStatement = await db.connection.prepare(
            `INSERT INTO Registration_secrets ("account_id", "registration_secret", "expiration_time")
            VALUES ($1, $2, NOW()+ interval '30 minutes');`,
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.varchar]}
        );

        this.getVerificationTokenStatement = await db.connection.prepare(
            `SELECT registration_secret, expiration_time FROM Registration_secrets
            WHERE account_id = $1`,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.validateUserAccountStatement = await db.connection.prepare(
            `UPDATE Accounts
            SET validated = TRUE
            WHERE id = $1;`,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.removeValidationTokenStatement = await db.connection.prepare(
            `DELETE FROM Registration_secrets
            WHERE account_id = $1`,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.insertNewAccountStatement = await db.connection.prepare(
            `INSERT INTO Accounts ("username","password_hash", "email_account")
            VALUES ($1, $2, $3) RETURNING id;`,
            {paramTypes: [DataTypeOIDs.varchar,DataTypeOIDs.varchar,DataTypeOIDs.varchar]}
        );
    }

    private async prepareUserServiceStatements () {
        this.getBuildingAdminsStatment = await db.connection.prepare(
            `
            SELECT account_id, a.username, a.email_account, a.validated, a.profile_picture, a.rfid, a.company_id, building_id, b.building_name, b.building_location
            FROM building_admins 
            LEFT JOIN accounts a ON a.id = building_admins.account_id
            LEFT JOIN buildings b ON b.id = building_admins.building_id;
            `
        );

        this.getCompanyAdminsStatement = await db.connection.prepare(
            `
            SELECT account_id, a.username, a.email_account, a.validated, a.profile_picture, a.rfid, a.company_id, company_admins.company_id, c.company_name
            FROM company_admins 
            LEFT JOIN Accounts a ON a.id = company_admins.account_id
            LEFT JOIN companies c ON c.id = company_admins.company_id;
            `
        );

        this.getAssignedBuildingAdminsStatement = await db.connection.prepare(
            `
            SELECT account_id, a.username, a.email_account, a.validated, a.profile_picture, a.rfid, a.company_id, building_id, b.building_name, b.building_location
            FROM building_admins 
            LEFT JOIN accounts a ON a.id = building_admins.account_id
            LEFT JOIN buildings b ON b.id = building_admins.building_id
            WHERE building_admins.building_id = $1;
            `,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.getAssignedCompanyAdminsStatement = await db.connection.prepare(
            `
            SELECT account_id, a.username, a.email_account, a.validated, a.profile_picture, a.rfid, a.company_id, company_admins.company_id, c.company_name
            FROM company_admins 
            LEFT JOIN Accounts a ON a.id = company_admins.account_id
            LEFT JOIN companies c ON c.id = company_admins.company_id
            WHERE company_admins.company_id = $1;
            `,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.deleteBuildingAdminStatement = await db.connection.prepare(
            `
            DELETE FROM Building_admins
            WHERE account_id = $1;
            `,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.deleteCompanyAdminStatement = await db.connection.prepare(
            `
            DELETE FROM Company_admins
            WHERE account_id = $1;
            `,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.deleteAccountStatement = await db.connection.prepare(
            `CALL delete_employee($1)`,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.deleteBuildingAccessStatement = await db.connection.prepare(
            `DELETE FROM building_accesses
            WHERE account_id = $1 AND building_id = $2;`,
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.int4]}
        );

        this.getUserDataStatement = await db.connection.prepare(
            `SELECT a.*, c.company_name
            FROM accounts a
            LEFT JOIN sessions s ON a.id = s.account_id
            LEFT JOIN companies c ON a.company_id = c.id
            WHERE s.session_secret = $1;
            `,
            {paramTypes: [DataTypeOIDs.varchar]}
        );
    }

    private async prepareMiddlewareStatements() {
        this.getSessionIDStatement = await db.connection.prepare(
            `SELECT * FROM Sessions
            WHERE session_secret = $1`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.deleteSessionIDStatmenet = await db.connection.prepare(
            `DELETE FROM Sessions
            WHERE session_secret = $1`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.updateSessionIDStatement = await db.connection.prepare(
            `UPDATE Sessions
            SET expiration_time = NOW() + interval '30 minutes'
            WHERE session_secret = $1`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.checkAdminAuthorizationStatement = await db.connection.prepare(
            `SELECT 
            CASE WHEN badmin.id IS NOT NULL THEN true ELSE false END as isbadmin,
            CASE WHEN cadmin.id IS NOT NULL THEN true ELSE false END as iscadmin,
            CASE WHEN padmin.id IS NOT NULL THEN true ELSE false END as ispadmin 
            FROM
            sessions as sessions
            LEFT JOIN accounts ON accounts.id = sessions.account_id
            LEFT JOIN building_admins as badmin ON badmin.account_id = accounts.id
            LEFT JOIN company_admins as cadmin ON cadmin.account_id = accounts.id
            LEFT JOIN platform_admins as padmin ON padmin.account_id = accounts.id
            WHERE sessions.session_secret = $1;`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );
    }

    private async prepareChargingStationServiceStatements() {
        this.createChargingStationStatement = await db.connection.prepare(
            `INSERT INTO Charging_stations ("building_id", "name")
            VALUES ($1, $2) RETURNING id;`,
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.varchar]}
        );

        this.createChargingConnectorStatement = await db.connection.prepare(
            `INSERT INTO charging_connectors ("charging_station_id", "charging_type_id", "serial_number", "power_output")
            VALUES ($1, $2, $3, $4);`,
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric, DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );

        this.getAllChargingStationsSpecificStatement = await db.connection.prepare(
            `SELECT cc.id, cc.charging_station_id, cs.name as charging_station_name,
                cc.charging_type_id, ct.type as charging_type,
                cs.building_id, building_name, building_location, company_id, company_name, cc.serial_number, cc.power_output,
                b.longitude, b.latitude
            FROM charging_connectors cc JOIN charging_stations cs ON cc.charging_station_id = cs.id 
                JOIN charging_types ct ON cc.charging_type_id = ct.id JOIN buildings b ON b.id = cs.building_id
                LEFT JOIN companies c ON cs.company_id = c.id
            WHERE b.id = $1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.getAllChargingStationsFullStatement = await db.connection.prepare(
            `SELECT cc.id, cs.id, cs.name as charging_station_name,
                cc.charging_type_id, ct.type as charging_type,
                cs.building_id, building_name, building_location, company_id, company_name, cc.serial_number, cc.power_output,
                b.longitude, b.latitude
            FROM charging_stations cs LEFT JOIN charging_connectors cc ON cc.charging_station_id = cs.id
                LEFT JOIN charging_types ct ON cc.charging_type_id = ct.id 
                LEFT JOIN buildings b ON b.id = cs.building_id
                LEFT JOIN companies c ON cs.company_id = c.id;`,
            {paramTypes: []}
        );

        this.getAvailabilityPercentageStatement = await db.connection.prepare(
            `SELECT * FROM get_percent_available($1,$2,$3);`,
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.int4, DataTypeOIDs.date]}
        );

        this.deleteChargingStationStatement = await db.connection.prepare(
            `DELETE FROM Charging_stations
            WHERE id = $1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.deleteChargingConnectorByStationIDStatement = await db.connection.prepare(
            `DELETE FROM Charging_connectors
            WHERE charging_station_id = $1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.deleteChargingConnectorStatement = await db.connection.prepare(
            `DELETE FROM Charging_connectors
            WHERE id = $1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.editChargingStationStatement = await db.connection.prepare(
            `call edit_station($1, $2, $3);`,
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.int4, DataTypeOIDs.varchar]}
        );

        this.editChargingConnectorStatement = await db.connection.prepare(
            `call edit_connector($1, $2, $3, $4);`,
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.int4, DataTypeOIDs.int4, DataTypeOIDs. int4]}
        );

        this.assignChargingStationToCompanyStatement = await db.connection.prepare(
            `UPDATE Charging_stations
            SET company_id = $1
            WHERE id = $2;`,
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );

        this.getAllAvailableChargingStationsStatement = await db.connection.prepare(
            `SELECT * FROM get_all_available($1);`,
            {paramTypes: [DataTypeOIDs.int4]}
        );
    }

    private async prepareChargingTypeServiceStatements() {
        this.createChargingTypeStatement = await db.connection.prepare(
            `INSERT INTO charging_types (type)
            VALUES ($1);`,
            {paramTypes: [DataTypeOIDs.varchar]}
        );

        this.getAllChargingTypesStatement = await db.connection.prepare(
            `SELECT * FROM charging_types;`,
            {paramTypes: []}
        );

        this.deleteChargingTypeStatement = await db.connection.prepare(
            `DELETE FROM charging_types
            WHERE id = $1;`,
            {paramTypes: [DataTypeOIDs.numeric]}
        );

        this.editChargingTypeStatement = await db.connection.prepare(
            `UPDATE charging_types
            SET type = $1
            WHERE id = $2;`,
            {paramTypes: [DataTypeOIDs.varchar, DataTypeOIDs.numeric]}
        );
    }

    private async prepareOCPPStatements() {
        this.getAllConnectorIDStatement = await db.connection.prepare(
            `SELECT station.name, connector.serial_number FROM 
            charging_connectors as connector
            LEFT JOIN charging_stations as station ON station.id = connector.charging_station_id;`,
            {paramTypes: []}
        );

        this.getAllNextReservationsStatement = await db.connection.prepare(
            `SELECT name, allocated_connector_id, allocated_to, rfid
            FROM Reservations as reservation
            LEFT JOIN charging_connectors connector ON connector.id = reservation.allocated_connector_id
            LEFT JOIN charging_stations station ON station.id = connector.charging_station_id
            LEFT JOIN accounts ON accounts.id = reservation.account_id
            WHERE reservation.allocated_from BETWEEN now()::timestamp - interval '10 minutes' AND now()::timestamp + interval '10 minutes'
            `,
            {paramTypes: []}
        );
    }

    private async prepareReservationStatements() {
        this.getAllAvailableChargingTypesAtBuildingForPersonStatement = await db.connection.prepare(
            `SELECT * FROM get_all_available_types_for_building_for_user($1, $2);`,
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.int4]}
        );

        this.getAllReservationsForPersonStatement = await db.connection.prepare(
            `SELECT * FROM reservations WHERE account_id = $1;`,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.getAllReservationsForBuildingStatement = await db.connection.prepare(
            `SELECT * FROM reservations WHERE desired_building_id = $1;`,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.getSpecificReservationStatement = await db.connection.prepare(
            `SELECT * FROM reservations WHERE id = $1;`,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.createReservationStatement = await db.connection.prepare(
            `SELECT * FROM create_reservation($1, $2, $3, $4, $5, $6);`,
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.int4, DataTypeOIDs.int4, DataTypeOIDs.timestamp, DataTypeOIDs.timestamp, DataTypeOIDs.int4]}
        );

        this.cancelReservationStatement = await db.connection.prepare(
            `SELECT * FROM cancel_reservation($1);`,
            {paramTypes: [DataTypeOIDs.int4]}
        );

        this.editReservationStatement = await db.connection.prepare(
            `SELECT * FROM edit_reservation($1,$2,$3,$4,$5);`,
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.timestamp, DataTypeOIDs.timestamp, DataTypeOIDs.int4, DataTypeOIDs.int4]}
        );
    }

    private async prepareCronjobStatements() {
        this.deleteExpiredSessionsStatement = await db.connection.prepare(
            `DELETE FROM sessions WHERE expiration_time < (now() - interval '1 hour');`);

        this.deleteExpiredRegistrationSecretsStatement = await db.connection.prepare(
            `DELETE FROM registration_secrets WHERE expiration_time < (now() - interval '1 hour');`);

        this.deleteExpiredResetPasswordSecretsStatement = await db.connection.prepare(
            `DELETE FROM reset_password_secrets WHERE expiration_time < (now() - interval '1 hour');`);

        this.deleteOldReservationsStatement = await db.connection.prepare(
            `DELETE FROM reservations WHERE desired_to < (current_date - interval '3 days');`);

    }

    public async init() {
        await Promise.all(
            [
                this.prepareAdminServiceStatements(),
                this.prepareAssignEmployeeServiceStatements(),
                this.prepareAuthServiceStatements(),
                this.prepareBuildingServiceStatements(),
                this.prepareCompanyServiceStatements(),
                this.prepareRegisterServiceStatements(),
                this.prepareUserServiceStatements(),
                this.prepareMiddlewareStatements(),
                this.prepareChargingStationServiceStatements(),
                this.prepareChargingTypeServiceStatements(),
                this.prepareOCPPStatements(),
                this.prepareReservationStatements(),
                this.prepareCronjobStatements()
            ]
        );
        log.info("All SQL statements have been prepared.");
    }
}

export const SQLStatementManager = new StatmentManager();