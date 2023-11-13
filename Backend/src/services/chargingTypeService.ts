import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import log from "../utils/logger";
import { SQLStatementManager } from "../utils/SQLStatementManager";
import { ChargingTypeResponse } from "../models/responseModels";
// ======================================== MAIN FUNCTIONS ========================================

async function createChargingType(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateChargingTypeRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    const result = await SQLStatementManager.createChargingTypeStatement.execute({params: [data.chargingType]});

    if (result.rowsAffected != 1)
        return {status:500, message: "Something went wrong while trying to create a new charging type", error: "Something went wrong while trying to create a new charging type.", data: result};
    return {status: 200, message: 'Successfully added a new charging type', error: null, data: null};
}

async function getAllChargingTypes(): Promise<APIResponse> {
    const result = await SQLStatementManager.getAllChargingTypesStatement.execute({params: []});
    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};    
    const returnedChargingTypes: ChargingTypeResponse[] =  parser.parseChargingTypeResponse(result.rows);
    return {status: 200, message: `Returned ${result.rows.length} charging types`, error: null, data: {'Result': returnedChargingTypes}};
}

async function deleteChargingType(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteChargingTypeRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    const result = await SQLStatementManager.deleteChargingTypeStatement.execute({params: [data.chargingTypeID]});

    if (result.rowsAffected != 1)
        return {status: 500, message: 'Failed to delete a charging type', error: 'Failed to delete a charging type.', data: result};
    return {status: 200, message: 'Successfully deleted a charging type.', error: null, data: null};
}

async function editChargingType(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditChargingTypeRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Incorrect data in request', data: {data}};
    }

    const result = await SQLStatementManager.editChargingTypeStatement.execute({params: [data.newChargingType, data.chargingTypeID]});

    if (result.rowsAffected != 1)
        return {status:500, message: 'Something went wrong while trying to edit a charging type.', error: 'Something went wrong while trying to edit a charging type.', data: result};
    return {status: 200, message: 'Successfully updated a charging type.', error: null, data:null};
}

export default {
    createChargingType,
    getAllChargingTypes,
    deleteChargingType,
    editChargingType
};