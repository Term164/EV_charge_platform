import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import { QueryResult } from "postgresql-client";
import log from "../utils/logger";
import { SQLStatementManager } from "../utils/SQLStatementManager";

// ======================================== MAIN FUNCTIONS ========================================

async function createBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const result = await SQLStatementManager.createBuildingStatement.execute({params: [data.buildingName, data.buildingLocation]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to create a new building.");

    return ({status: 200, data: {'Result': 'Successfully added new building.'}});
}

async function getAllBuildings(): Promise<APIResponse> {

    const result = await SQLStatementManager.getAllBuildingsStatement.execute({params: []});

    return ({status: 200, data: {'Result': result.rows}});
}

async function deleteBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const result = await SQLStatementManager.deleteBuildingStatement.execute({params: [data.buildingID]});

    if (result.rowsAffected != 1) // throw new Error("Something went wrong while trying to delete a building.");
        return ({status: 400, data: {'Error': 'Failed to delete a building.'}});

    return ({status: 200, data: {'Result': 'Successfully deleted a building.'}});
}

async function editBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    try {
        const result = await SQLStatementManager.editBuildingStatement.execute({params: [data.buildingID, data.newBuildingName, data.newBuildingLocation]}); //data.buildingID
        log.debug("result: ", result);
    } catch (error: unknown) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Building with given ID not found'}};
    }

    return ({status: 200, data: {'Result': 'Successfully edited a building.'}});
}

async function getAllBuildingsOwnedByCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        //parseDeleteCompanyRequest here, since it parses the same interface -> companyID
        data = parser.parseDeleteCompanyRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const result = await SQLStatementManager.getAllBuildingsByCompanyStatement.execute({params: [data.companyID]});

    return ({status: 200, data: {'Result': result.rows}});
}

async function getAllCompaniesAssignedToBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        //parseDeleteBuildingRequest here, since it parses the same interface -> buildingID
        data = parser.parseDeleteBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const result = await SQLStatementManager.getAllCompaniesAssignedToBuildingStatement.execute({params: [data.buildingID]});

    return ({status: 200, data: {'Result': result.rows}});
}

async function assignCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignCompanyRequest(body);
    } catch (error) {
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    let result: QueryResult;
    try {
        result = await SQLStatementManager.assignCompanyStatement.execute({params: [data.companyID, data.buildingID]});
    } catch (error) {

        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_6')) errorMessage = 'This building does not exist';
                else if (error.message.includes('fk_7')) errorMessage = 'This company does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 1';
                return {status: 400, data: {'Error': errorMessage}};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1) throw new Error("Something went wrong while trying to assign a company to a building.");

    return ({status: 200, data: {'Result:': 'Successfully assigned a company to a building.'}});
}

export default {
    getAllBuildings,
    createBuilding,
    editBuilding,
    deleteBuilding,
    getAllBuildingsOwnedByCompany,
    getAllCompaniesAssignedToBuilding,
    assignCompany
};
