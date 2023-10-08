import { APIResponse } from "../models/requestModels";
import db from '.././utils/database';
import modelParser from "../models/modelParser";
import { SQLStatementManager } from "../utils/SQLStatementManager";

// ================================ MAIN FUNCTIONS ==============================

async function getBuildingAdmins(): Promise<APIResponse> {
    const result = await SQLStatementManager.getBuildingAdminsStatment.execute();

    const parsedArray = result.rows?.map((buildingAdminData) => {
        if (Array.isArray(buildingAdminData)) {
            buildingAdminData.splice(2,0,'***');
            return modelParser.parseBuildingAdmin(buildingAdminData);
        } else throw new Error('building admin data is not in array format.');
    });

    return ({status: 200, message: `Returned ${result.rows?.length} building admins `, error: null , data: {"result": parsedArray}});
}

async function getCompanyAdmins(): Promise<APIResponse> {
    const result = await SQLStatementManager.getCompanyAdminsStatement.execute();

    const parsedArray = result.rows?.map((companyAdminData) => {
        if (Array.isArray(companyAdminData)) {
            companyAdminData.splice(2,0,'***');
            return modelParser.parseCompanyAdmin(companyAdminData);
        } else throw new Error('company admin data is not in array format.');
    });

    return ({status: 200, message: `Returned ${result.rows?.length} building admins`, error: null , data: {"result": parsedArray}});
}

async function getAssignedBuildingAdmins(requestBody: unknown): Promise<APIResponse> {

    if (!requestBody || typeof requestBody !== 'object') {
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    let buildingID: number;
    if ('buildingID' in requestBody) {
        buildingID = modelParser.parseIntegerParameterFromString(requestBody.buildingID, 'buildingID');
    } else {
        return ({status: 400, message: "parameter buildingID missing",  error: null , data: null});
    }

    const result = await SQLStatementManager.getAssignedBuildingAdminsStatement.execute({params: [buildingID]});

    const parsedArray = result.rows?.map((buildingAdminData) => {
        if (Array.isArray(buildingAdminData)) {
            buildingAdminData.splice(2,0,'***');
            return modelParser.parseBuildingAdmin(buildingAdminData);
        } else throw new Error('building admin data is not in array format.');
    });

    return ({status: 200, message: `Returned ${result.rows?.length} building admins`, error: null , data: {"result": parsedArray}});
}

async function getAssignedCompanyAdmins(requestBody: unknown): Promise<APIResponse> {

    if (!requestBody || typeof requestBody !== 'object') {
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    let companyID: number;
    if ('companyID' in requestBody) {
        companyID = modelParser.parseIntegerParameterFromString(requestBody.companyID, 'companyID');
    } else {
        return ({status: 400, message: "parameter companyID missing", error: null, data: null});
    }

    const result = await SQLStatementManager.getAssignedCompanyAdminsStatement.execute({params: [companyID]});

    const parsedArray = result.rows?.map((companyAdminData) => {
        if (Array.isArray(companyAdminData)) {
            companyAdminData.splice(2,0,'***');
            return modelParser.parseCompanyAdmin(companyAdminData);
        } else throw new Error('company admin data is not in array format.');
    });

    return ({status: 200, message: `Returned ${result.rows?.length} company admins`, error: null, data: {"result": parsedArray}});
}

async function deleteBuildingAdmin(requestBody: unknown): Promise<APIResponse> {
    let userID: number;
    try {
        userID = modelParser.parseUserID(requestBody);
    } catch (error) {
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.deleteBuildingAdminStatement.execute({params: [userID]});

    if (result.rowsAffected != 1) return {status: 400, message: `User with id '${userID}' is not an admin of any building or does not exist.`, error: null, data: null};
    else return {status: 200, message: "operation completed successfully", error: null , data: null};
}

async function deleteCompanyAdmin(requestBody: unknown): Promise<APIResponse> {
    let userID: number;
    try {
        userID = modelParser.parseUserID(requestBody);
    } catch (error) {
        console.log(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.deleteCompanyAdminStatement.execute({params: [userID]});

    if (result.rowsAffected != 1) return {status: 400, message: `User with id '${userID}' is not an admin of any company or does not exist.` , error: null, data: null};
    else return {status: 200, message: "operation completed successfully", error: null, data: null};
}

async function deleteAccount(requestBody: unknown): Promise<APIResponse> {
    let userID: number;
    try {
        userID = modelParser.parseUserID(requestBody);
    } catch (error) {
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    await SQLStatementManager.deleteAccountStatement.execute({params: [userID]});

    return {status: 200, message: "User deleted successfully", error: null, data: null};
}

async function deleteBuildingAccess(requestBody: unknown): Promise<APIResponse> {
    const deleteRequestData = modelParser.parseDeleteBuildingAccessRequest(requestBody);

    const result = await SQLStatementManager.deleteBuildingAccessStatement.execute({params: [deleteRequestData.userID, deleteRequestData.buildingID]});

    if (result.rowsAffected != 1) return {status: 400, message: `User with id '${deleteRequestData.userID}' does not have specific access to this building or the user/building does not exist.`,  error: null, data: null};
    else return {status: 200, message: "Successfully revoked user permission for building" , error: null, data:null};

}

async function editUserProfile(requestBody: unknown): Promise <APIResponse> {
    const editUserProfileData = modelParser.parseEditUserProfileRequest(requestBody);

    const filteredValues = Object.entries(editUserProfileData).filter((pair) => pair[1] !== undefined);
    const queryParameters = filteredValues.map((pair) => pair[1]);

    if (queryParameters.length < 2) return {status: 418, message:"Must provide more details then just the userID.", error: 'Not enough parameters provided', data: null};

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

    if (result.rowsAffected != 1) return {status: 400, message: `User with id '${editUserProfileData.id}' does not exist.` , error: null , data: null};
    else return {status: 200, message: `Successfully updated the following values: ${filteredValues.map((pair) => pair[0]).slice(1,filteredValues.length).join(' , ')} for user with id ${editUserProfileData.id}` , error: null, data: null};
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