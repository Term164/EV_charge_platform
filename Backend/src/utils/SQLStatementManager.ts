import db from './database';
import { DataTypeOIDs, PreparedStatement } from "postgresql-client";


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

    // Middleware
    getSessionIDStatement: PreparedStatement;
    deleteSessionIDStatmenet: PreparedStatement;
    updateSessionIDStatement: PreparedStatement;

    private async prepareAdminServiceStatements() {
        this.assignBadminStatement = await db.connection.prepare(
            `INSERT INTO Building_admins (account_id, building_id)
            VALUES ($1, $2)
            ON CONFLICT ON CONSTRAINT unique_account_building DO NOTHING;`,
            {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
        );

        this.assignCadminStatement = await db.connection.prepare(
            `INSERT INTO company_admins (account_id, company_id)
            VALUES ($1, $2)
            ON CONFLICT ON CONSTRAINT unique_account_company DO NOTHING;`,
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
            ON CONFLICT ON CONSTRAINT unique_account_building_access DO NOTHING;;`,
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
    }

    private async prepareBuildingServiceStatements () {
        this.createBuildingStatement = await db.connection.prepare(
            `INSERT INTO Buildings (building_name, building_location)
            VALUES ($1, $2);`,
            {paramTypes: [DataTypeOIDs.varchar, DataTypeOIDs.varchar]}
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
            `call edit_building($1, $2, $3);`, // Check 'edit_building' in 'procedures.sql' for info
            {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.varchar, DataTypeOIDs.varchar]}
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
            ON CONFLICT ON CONSTRAINT unique_building_company DO NOTHING;`,
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
    }

    public async init() {
        await this.prepareAdminServiceStatements();
        await this.prepareAssignEmployeeServiceStatements();
        await this.prepareAuthServiceStatements();
        await this.prepareBuildingServiceStatements();
        await this.prepareCompanyServiceStatements();
        await this.prepareRegisterServiceStatements();
        await this.prepareUserServiceStatements();
        await this.prepareMiddlewareStatements();
    }
}

export const SQLStatementManager = new StatmentManager();