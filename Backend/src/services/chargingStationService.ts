import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import log from "../utils/logger";
import { SQLStatementManager } from "../utils/SQLStatementManager";
import { QueryResult } from "postgresql-client";

// ======================================== MAIN FUNCTIONS ========================================

async function createStation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateStationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    const result = await SQLStatementManager.createChargingStationStatement.execute({params: [data.chargingTypeID, data.buildingID, data.stationName]});

    if (result.rowsAffected != 1)
        return {status: 500, message: 'Something went wrong while trying to create a new station', error: 'Something went wrong while trying to create a new station', data: result};
    return {status: 200, message: 'Successfully added new charging station.', error: null, data: null};
}

async function getAllStations(body: unknown): Promise<APIResponse> {
    let data;
    try {
        //parseDeleteBuildingRequest here, since it parses the same interface -> buildingID
        data = parser.parseGetAllStationsRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error:'Incorrect data in request', data: {data}};
    }

    let statement, args: unknown[];
    if (data.buildingID) {
        statement = SQLStatementManager.getAllChargingStationsSpecificStatement;
        args = [data.buildingID];
    } else {
        statement = SQLStatementManager.getAllChargingStationsFullStatement;
        args = [];
    }

    const result = await statement.execute({params: args});
    return {status: 200, message: `Returned ${result.rows?.length} stations`, error:null, data: {'Result': result.rows}};
}

async function deleteStation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteStationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    const result = await SQLStatementManager.deleteChargingStationStatement.execute({params: [data.stationID]});

    if (result.rowsAffected != 1)
        return {status: 500, message: 'Failed to delete a station', error: 'Failed to delete a station.', data: result};
    return {status: 200, message: 'Successfully deleted a station', error: null, data: {'Result': 'Successfully deleted a station.'}};
}

async function editStation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditStationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    try {
        await SQLStatementManager.editChargingStationStatement.execute({params: [data.stationID, data.newTypeID, data.newBuildingID, data.newStationName]});
    } catch (error: unknown) {
        log.debug(error);
        return {status: 500, message: 'Something went wrong while editing a station.', error: 'Something went wrong. Check your IDs.', data: {error}};
    }
    return {status: 200, message: 'Successfully edited a station', error: null, data: {'Result': 'Successfully edited a station.'}};
}

/** Can also be used to free a station -> companyID=null */
async function assignCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignStationToCompanyRequest(body);
    } catch (error) {
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    let result: QueryResult;
    try {
        result = await SQLStatementManager.assignChargingStationToCompanyStatement.execute({params: [data.companyID, data.stationID]});
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_16')) errorMessage = 'This company does not exist';
                else errorMessage = 'Something went wrong, please contact the site administrators, error code: 1';
                return {status: 500, message: "Something went wrong.", error: errorMessage, data: error};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1)
        return {status: 500, message: "Something went wrong while trying to assign station to a company", error: "Something went wrong while trying to assign station to a company.", data: result};
    return {status: 200, message: (data.companyID != null) ? 'Successfully assigned station to a company.'
        : 'Successfully cleared a company reservation for a station.', error:null, data:result};
}

async function getAllAvailableStations(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseGetAllAvailableStationsRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    const result = await SQLStatementManager.getAllAvailableChargingStationsStatement.execute({params: [data.userID]});
    return {status: 200, message: `Returned ${result.rows?.length} stations`, error:null, data:{'Result': result.rows}};
}

export default {
    getAllStations,
    createStation,
    deleteStation,
    assignCompany,
    editStation,
    getAllAvailableStations
};
