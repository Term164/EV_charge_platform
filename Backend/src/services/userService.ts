import { APIResponse } from "../models/requestModels";
import db from '.././utils/database';
import modelParser from "../models/modelParser";

// ================================ MAIN FUNCTIONS ==============================

async function getBuildingAdmins(): Promise<APIResponse> {
    const result = await db.connection.query(
        `
        SELECT account_id, a.username, a.email_account, a.validated, a.profile_picture, a.rfid, a.company_id, building_id, b.building_name, b.building_location
        FROM building_admins 
        LEFT JOIN accounts a ON a.id = building_admins.account_id
        LEFT JOIN buildings b ON b.id = building_admins.building_id;
        `
    );

    const parsedArray = result.rows?.map((buildingAdminData) => {
        if (Array.isArray(buildingAdminData)) {
            buildingAdminData.splice(2,0,'***');
            return modelParser.parseBuildingAdmin(buildingAdminData);
        } else throw new Error('building admin data is not in array format.');
    });

    return ({status: 200, data: {"result": parsedArray}});
}

async function getCompanyAdmins(): Promise<APIResponse> {
    const result = await db.connection.query(
        `
        SELECT account_id, a.username, a.email_account, a.validated, a.profile_picture, a.rfid, a.company_id, company_admins.company_id, c.company_name
        FROM company_admins 
        LEFT JOIN Accounts a ON a.id = company_admins.account_id
        LEFT JOIN companies c ON c.id = company_admins.company_id;

        `
    );

    const parsedArray = result.rows?.map((companyAdminData) => {
        if (Array.isArray(companyAdminData)) {
            companyAdminData.splice(2,0,'***');
            return modelParser.parseCompanyAdmin(companyAdminData);
        } else throw new Error('company admin data is not in array format.');
    });

    return ({status: 200, data: {"result": parsedArray}});
}

async function getAssignedBuildingAdmins(requestBody: unknown): Promise<APIResponse> {

    if (!requestBody || typeof requestBody !== 'object') {
        return ({status: 400, data: {"Error":"Incorrect or missing data"}});
    }

    let buildingID: number;
    if ('buildingID' in requestBody) {
        buildingID = modelParser.parseIntegerParameterFromString(requestBody.buildingID, 'buildingID');
    } else {
        return ({status: 400, data: {"Error":"parameter buildingID missing"}});
    }

    const result = await db.connection.query(
        `
        SELECT account_id, a.username, a.email_account, a.validated, a.profile_picture, a.rfid, a.company_id, building_id, b.building_name, b.building_location
        FROM building_admins 
        LEFT JOIN accounts a ON a.id = building_admins.account_id
        LEFT JOIN buildings b ON b.id = building_admins.building_id
        WHERE building_admins.id = $1;
        `,
        {params: [buildingID]}
    );


    const parsedArray = result.rows?.map((buildingAdminData) => {
        if (Array.isArray(buildingAdminData)) {
            buildingAdminData.splice(2,0,'***');
            return modelParser.parseBuildingAdmin(buildingAdminData);
        } else throw new Error('building admin data is not in array format.');
    });

    return ({status: 200, data: {"result": parsedArray}});
}

async function getAssignedCompanyAdmins(requestBody: unknown): Promise<APIResponse> {

    if (!requestBody || typeof requestBody !== 'object') {
        return ({status: 400, data: {"Error":"Incorrect or missing data"}});
    }

    let companyID: number;
    if ('companyID' in requestBody) {
        companyID = modelParser.parseIntegerParameterFromString(requestBody.companyID, 'companyID');
    } else {
        return ({status: 400, data: {"Error":"parameter companyID missing"}});
    }

    const result = await db.connection.query(
        `
        SELECT account_id, a.username, a.email_account, a.validated, a.profile_picture, a.rfid, a.company_id, company_admins.company_id, c.company_name
        FROM company_admins 
        LEFT JOIN Accounts a ON a.id = company_admins.account_id
        LEFT JOIN companies c ON c.id = company_admins.company_id
        WHERE company_admins.id = $1;
        `,
        {params: [companyID]}
    );

    const parsedArray = result.rows?.map((companyAdminData) => {
        if (Array.isArray(companyAdminData)) {
            companyAdminData.splice(2,0,'***');
            return modelParser.parseCompanyAdmin(companyAdminData);
        } else throw new Error('company admin data is not in array format.');
    });

    return ({status: 200, data: {"result": parsedArray}});
}

async function deleteBuildingAdmin(requestBody: unknown): Promise<APIResponse> {
    let userID: number;
    try {
        userID = modelParser.parseUserID(requestBody);
    } catch (error) {
        return {status: 400, data: {"error":error}};
    }

    const result = await db.connection.query(
        `
        DELETE FROM Building_admins
        WHERE account_id = $1;
        `,
        {params: [userID]}
    );

    if (result.rowsAffected != 1) return {status: 400, data: {"error": `User with id '${userID}' is not an admin of any building or does not exist.`}};
    else return {status: 200, data:{"result": "operation completed successfully"}};
}

async function deleteCompanyAdmin(requestBody: unknown): Promise<APIResponse> {
    let userID: number;
    try {
        userID = modelParser.parseUserID(requestBody);
    } catch (error) {
        return {status: 400, data: {"error":error}};
    }

    const result = await db.connection.query(
        `
        DELETE FROM Company_admins
        WHERE account_id = $1;
        `,
        {params: [userID]}
    );

    if (result.rowsAffected != 1) return {status: 400, data: {"error": `User with id '${userID}' is not an admin of any company or does not exist.`}};
    else return {status: 200, data:{"result": "operation completed successfully"}};
}

async function deleteAccount(requestBody: unknown): Promise<APIResponse> {
    let userID: number;
    try {
        userID = modelParser.parseUserID(requestBody);
    } catch (error) {
        return {status: 400, data: {"error":error}};
    }

    await db.connection.query(
        `CALL delete_employee($1)`,
        {params: [userID]}
    );

    return {status: 200, data: {"result": "User deleted successfully"}};
}

async function deleteBuildingAccess(requestBody: unknown): Promise<APIResponse> {
    const deleteRequestData = modelParser.parseDeleteBuildingAccessRequest(requestBody);

    const result = await db.connection.query(
        `DELETE FROM building_accesses
        WHERE account_id = $1 AND building_id = $2;`,
        {params: [deleteRequestData.userID, deleteRequestData.buildingID]}
    );

    if (result.rowsAffected != 1) return {status: 400, data: {"error": `User with id '${deleteRequestData.userID}' does not have specific access to this building or the user/building does not exist.`}};
    else return {status: 200, data:{"result": "Successfully revoked user permission for building"}};

}

async function editUserProfile(requestBody: unknown): Promise <APIResponse> {
    const editUserProfileData = modelParser.parseEditUserProfileRequest(requestBody);

    const filteredValues = Object.entries(editUserProfileData).filter((pair) => pair[1] !== undefined);
    const queryParameters = filteredValues.map((pair) => pair[1]);

    const queryBuilderArray = [];
    for (let i = 1; i < filteredValues.length; i++) {
        queryBuilderArray[i-1] = `${filteredValues[i][0]} = $${i+1}`;
    }

    const queryString = queryBuilderArray.join(',');

    const result = await db.connection.query(
        `UPDATE Accounts
        SET ${queryString}
        WHERE id = $1`,
        {params: queryParameters}
    );

    if (result.rowsAffected != 1) return {status: 400, data: {"error": `User with id '${editUserProfileData.id}' does not exist.`}};
    else return {status: 200, data:{"result": `Successfully updated the following values: ${filteredValues.map((pair) => pair[0]).slice(1,filteredValues.length).join(' , ')} for user with id ${editUserProfileData.id}`}};
}

export default {
    getBuildingAdmins,
    getCompanyAdmins,
    getAssignedBuildingAdmins,
    getAssignedCompanyAdmins,
    deleteBuildingAdmin,
    deleteCompanyAdmin,
    deleteAccount,
    deleteBuildingAccess,
    editUserProfile
};