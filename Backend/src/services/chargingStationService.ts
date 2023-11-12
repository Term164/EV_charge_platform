import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import log from "../utils/logger";
import db from '../utils/database';
import { SQLStatementManager } from "../utils/SQLStatementManager";
import { PreparedStatement, QueryResult } from "postgresql-client";
import { ChargingStationResponse } from "../models/responseModels";

// ======================================== MAIN FUNCTIONS ========================================

async function createStation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateStationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: (error as Error).message, data: {data}};
    }

    await db.connection.startTransaction();

    let stationResult;
    try {
        stationResult = await SQLStatementManager.createChargingStationStatement.execute({params: [data.buildingID, data.stationName]});
    } catch (error) {
        await db.connection.rollback();
        if (error instanceof Error) {
            if (error.message.includes("constraint")) {
                let errorMessage: string;
                if (error.message.includes('uni_charging_stations_name')) errorMessage = 'This station name already exists';
                else if (error.message.includes('frn_charging_stations_building_id')) errorMessage = 'This building does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 5';
                return {status: 400, message: errorMessage,error: error.message, data: null};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }
    if (stationResult.rowsAffected != 1) {
        await db.connection.rollback();
        return {status: 500, message: 'Something went wrong while trying to create a connector', error: 'Something went wrong while trying to create a connector', data: stationResult};
    }
    const stationID = stationResult.rows?.at(0)[0] as number;

    for (let i = 0; i < data.chargingConnectors.length; i++) {
        let connectorResult;
        try {
            connectorResult = await SQLStatementManager.createChargingConnectorStatement.execute({params: [stationID, data.chargingConnectors[i].chargingTypeID, data.chargingConnectors[i].serialNumber]});
        } catch (error) {
            await db.connection.rollback();
            if (error instanceof Error) {
                if (error.message.includes("constraint")) {
                    let errorMessage: string;
                    if (error.message.includes('frn_charging_connectors_charging_type_id')) errorMessage = 'This charging type does not exist';
                    else errorMessage = 'Something went wrong please contact the site administrators, error code: 5';
                    return {status: 400, message: errorMessage,error: error.message, data: null};
                }
            }
            throw new Error("Unexpected error occured: " + error);
        }
        if (connectorResult.rowsAffected != 1) {
            await db.connection.rollback();
            return {status: 500, message: 'Something went wrong while trying to create a connector', error: 'Something went wrong while trying to create a connector', data: {}};
        }
    }

    await db.connection.commit();
    return {status: 200, message: 'Successfully added new charging station with connectors.', error: null, data: null};
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

    let statement: PreparedStatement, args: any[];
    if (data.buildingID) {
        statement = SQLStatementManager.getAllChargingStationsSpecificStatement;
        args = [data.buildingID];
    } else {
        statement = SQLStatementManager.getAllChargingStationsFullStatement;
        args = [];
    }
    const result = await statement.execute({params: args});
    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};

    const returnedStations: ChargingStationResponse[] =  parser.parseChargingStationResponse(result.rows, data.buildingID != null );
    return {status: 200, message: `Returned ${result.rows.length} connectors in total`, error: null, data: {'Result': returnedStations}};
}

async function deleteStation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteStationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    await db.connection.startTransaction();
    const connectorResult = await SQLStatementManager.deleteChargingConnectorByStationIDStatement.execute({params: [data.stationID]});
    if (connectorResult.rowsAffected == 0) {
        await db.connection.rollback();
        return {status: 500, message: 'Failed to delete some connectors', error: 'Failed to delete some connectors, possibly the station doesn\'t exist', data: connectorResult};
    }
    const stationResult = await SQLStatementManager.deleteChargingStationStatement.execute({params: [data.stationID]});
    if (stationResult.rowsAffected != 1) {
        await db.connection.rollback();
        return {status: 500, message: 'Failed to delete a station', error: 'Failed to delete a station.', data: stationResult};
    }

    await db.connection.commit();
    return {status: 200, message: 'Successfully deleted a station and its connectors', error: null, data: {}};
}

/** Only for station name or building id

*  Changing connectors has different request */
async function editStation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditStationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    try {
        await SQLStatementManager.editChargingStationStatement.execute({params: [data.stationID, data.newBuildingID, data.newStationName]});
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes("constraint")) {
                let errorMessage: string;
                if (error.message.includes('frn_charging_stations_building_id')) errorMessage = 'This building does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 7';
                return {status: 400, message: errorMessage,error: error.message, data: error};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }
    return {status: 200, message: 'Successfully edited a station', error: null, data: {}};
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
            if (error.message.includes("constraint")) {
                let errorMessage: string;
                if (error.message.includes('frn_charging_stations_company_id')) errorMessage = 'This company does not exist';
                else errorMessage = 'Something went wrong, please contact the site administrators, error code: 1';
                return {status: 400, message: "Something went wrong.", error: errorMessage, data: error};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number != 1)
        return {status: 500, message: "Something went wrong while trying to assign station to a company", error: "Possibly the station does not exist.", data: result};
    return {status: 200, message: (data.companyID != null) ? 'Successfully assigned station to a company.'
        : 'Successfully cleared a company reservation for a station.', error:null, data:{}};
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
    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};

    const returnedStations: ChargingStationResponse[] =  parser.parseChargingStationResponse(result.rows, false);
    return {status: 200, message: `Returned ${result.rows.length} connectors in total`, error: null, data: {'Result': returnedStations}};
}

export default {
    getAllStations,
    createStation,
    deleteStation,
    assignCompany,
    editStation,
    getAllAvailableStations
};
