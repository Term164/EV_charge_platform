import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import log from "../utils/logger";
import db from '../utils/database';
import { SQLStatementManager } from "../utils/SQLStatementManager";
// ======================================== MAIN FUNCTIONS ========================================

async function addChargingConnector(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAddChargingConnectorRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: (error as Error).message, data: (error as Error)};
    }

    let result;
    try {
        result = await SQLStatementManager.createChargingConnectorStatement.execute({params: [data.stationID, data.chargingConnector.chargingTypeID, data.chargingConnector.serialNumber, data.chargingConnector.powerOutput]});
    } catch (error) {
        await db.connection.rollback();
        if (error instanceof Error) {
            if (error.message.includes("constraint")) {
                let errorMessage: string;
                if (error.message.includes('uni_charging_connectors_charging_station_id_serial_number')) errorMessage = 'This serial number already exists';
                else if (error.message.includes('frn_charging_connectors_charging_type_id')) errorMessage = 'This charging type does not exist';
                else if (error.message.includes('frn_charging_connectors_charging_station_id')) errorMessage = 'This charging station does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 11';
                return {status: 400, message: errorMessage,error: error.message, data: null};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected != 1)
        return {status:500, message: "Something went wrong while trying to create a new charging type", error: "Something went wrong while trying to create a connector.", data: {}};
    return {status: 200, message: 'Successfully added a new connector', error: null, data: null};
}

async function deleteChargingConnector(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseChargingConnectorID(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {error}};
    }

    const result = await SQLStatementManager.deleteChargingConnectorStatement.execute({params: [data]});

    if (result.rowsAffected != 1)
        return {status: 400, message: 'Failed to delete a connector, probably doesn\'t exist.', error: 'Failed to delete a connector, probably doesn\'t exist.', data: result};
    return {status: 200, message: 'Successfully deleted a connector.', error: null, data: null};
}

async function editChargingConnector(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditChargingConnectorRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {error}};
    }

    await db.connection.startTransaction();
    try {
        await SQLStatementManager.editChargingConnectorStatement.execute({params: [data.chargingConnectorID, data.chargingTypeID, data.serialNumber, data.powerOutput]});
    } catch (error) {
        await db.connection.rollback();
        if (error instanceof Error) {
            if (error.message.includes("constraint")) {
                let errorMessage: string;
                if (error.message.includes('frn_charging_connectors_charging_type_id')) errorMessage = 'This charging type does not exist';
                else if (error.message.includes('uni_charging_connectors_charging_station_id_serial_number')) errorMessage = 'This serial number is already in use';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 9';
                return {status: 400, message: errorMessage,error: error.message, data: null};
            } else if (error.message.includes("not found")) {
                let errorMessage: string;
                if (error.message.includes('Connector with ID')) errorMessage = 'This charging connector does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 13';
                return {status: 400, message: errorMessage,error: error.message, data: null};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    return {status: 200, message: 'Successfully updated a charging connector.', error: null, data:null};
}

export default {
    addChargingConnector,
    deleteChargingConnector,
    editChargingConnector
};