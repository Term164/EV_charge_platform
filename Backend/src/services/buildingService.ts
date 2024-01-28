import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import { QueryResult } from "postgresql-client";
import log from "../utils/logger";
import { SQLStatementManager } from "../utils/SQLStatementManager";
import { BuildingResponse, CompanyResponse } from "../models/responseModels";

// ======================================== MAIN FUNCTIONS ========================================

async function createBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.createBuildingStatement.execute({params: [data.buildingName, data.buildingLocation, data.buildingLongitude, data.buildingLatitude]});

    if (result.rowsAffected != 1)
        return {status: 500, message: "Something went wrong while trying to create a new building.", error: "Something went wrong while trying to create a new building", data: result};
    return ({status: 200, message: 'Successfully added new building.', error: null, data: null});
}

async function getAllBuildings(): Promise<APIResponse> {

    const result = await SQLStatementManager.getAllBuildingsStatement.execute({params: []});

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    const returnedBuildings: BuildingResponse[] =  parser.parseBuildingResponse(result.rows);
    return {status: 200, message: `Returned ${result.rows?.length} buildings`, error: null, data: {'Result': returnedBuildings}};
}

async function deleteBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseBuildingID(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.deleteBuildingStatement.execute({params: [data]});

    if (result.rowsAffected != 1) // throw new Error("Something went wrong while trying to delete a building.");
        return ({status: 400, message: 'Failed to delete a building.', error: 'Returned number of rows affected while deleting a building was not 1.', data: null});

    return ({status: 200, message: 'Successfully deleted a building.', error: null, data: null});
}

async function editBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    try {
        const result = await SQLStatementManager.editBuildingStatement.execute({params: [data.buildingID, data.newBuildingName, data.newBuildingLocation, data.newBuildingLongitude, data.newBuildingLatitude]});
        log.debug("result: ", result);
    } catch (error: unknown) {
        log.debug(error);
        return {status: 400, message: 'Building with given ID not found', error: null, data: null};
    }

    return ({status: 200, message: 'Successfully edited a building.', error: null, data: null});
}

async function getAllBuildingsOwnedByCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCompanyID(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.getAllBuildingsByCompanyStatement.execute({params: [data]});

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    const returnedBuildings: BuildingResponse[] =  parser.parseBuildingResponse(result.rows);
    return {status: 200, message: `Returned ${result.rows?.length} buildings`, error: null, data: {'Result': returnedBuildings}};
}

async function getAllCompaniesAssignedToBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseBuildingID(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.getAllCompaniesAssignedToBuildingStatement.execute({params: [data]});

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    const returnedCompanies: CompanyResponse[] =  parser.parseCompanyResponse(result.rows);
    return {status: 200, message: `Returned ${result.rows.length} companies`, error: null, data: {'Result': returnedCompanies}};
}

async function assignCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignCompanyRequest(body);
    } catch (error) {
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    let result: QueryResult;
    try {
        result = await SQLStatementManager.assignCompanyStatement.execute({params: [data.companyID, data.buildingID]});
    } catch (error) {

        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('frn_building_company_building_id')) errorMessage = 'This building does not exist';
                else if (error.message.includes('frn_building_company_company_id')) errorMessage = 'This company does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 1';
                return {status: 400, message: errorMessage, error: error.message , data: null};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1) throw new Error("Something went wrong while trying to assign a company to a building.");

    return ({status: 200, message: 'Successfully assigned a company to a building.', error: null, data: null});
}

async function deleteAssignedCompany(body: unknown): Promise<APIResponse> {
    let buildingID;
    let companyID;
    try {
        buildingID = parser.parseBuildingID(body);
       	companyID = parser.parseCompanyID(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.deleteAssignedCompanyStatement.execute({params: [buildingID, companyID]});

    if (result.rowsAffected != 1) // throw new Error("Something went wrong while trying to delete a building.");
        return ({status: 400, message: 'Failed to delete a building.', error: 'Returned number of rows affected while deleting a building was not 1.', data: null});

    return ({status: 200, message: 'Successfully deleted a building.', error: null, data: null});
}


export default {
    getAllBuildings,
    createBuilding,
    editBuilding,
    deleteBuilding,
    getAllBuildingsOwnedByCompany,
    getAllCompaniesAssignedToBuilding,
    assignCompany,
    deleteAssignedCompany
};
