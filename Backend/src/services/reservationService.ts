import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import log from "../utils/logger";
import { SQLStatementManager } from "../utils/SQLStatementManager";

// ======================================== MAIN FUNCTIONS ========================================

async function createReservation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateReservationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.createBuildingStatement.execute({params: [data.userID, data.buildingID, data.chargingTime, data.desiredFrom, data.desiredTo, data.chargingTypeID]});

    if (result.rowsAffected != 1)
        return {status: 500, message: "Something went wrong while trying to create a reservation.", error: "Something went wrong while trying to create a reservation", data: result};
    return ({status: 200, message: 'Successfully created a reservation.', error: null, data: {"Result": result}});
}

async function getAllReservations(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseUserID(body);
    } catch (error) {
        log.debug(data, error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.getAllBuildingsStatement.execute({params: []});

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    //const returnedBuildings: BuildingResponse[] =  parser.parseBuildingResponse(result.rows);
    return {status: 200, message: `Returned ${result.rows?.length} reservations`, error: null, data: {'Result': result}};
}

async function cancelReservation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseReservationID(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.deleteBuildingStatement.execute({params: [data.reservationID]});

    if (result.rowsAffected != 1)
        return ({status: 400, message: 'Failed to cancel a reservation.', error: 'Returned number of rows affected while canceling a reservation was not 1.', data: null});

    return ({status: 200, message: 'Successfully canceled a reservation.', error: null, data: null});
}

async function editReservation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    try {
        const result = await SQLStatementManager.editBuildingStatement.execute({params: [data.buildingID, data.newBuildingName, data.newBuildingLocation]}); //data.buildingID
        log.debug("result: ", result);
    } catch (error: unknown) {
        log.debug(error);
        return {status: 400, message: 'Building with given ID not found', error: null, data: null};
    }

    return ({status: 200, message: 'Successfully edited a building.', error: null, data: null});
}

async function getAllTypesAtBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseBuildingID(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing data', data: {error}};
    }

    const result = await SQLStatementManager.getAllBuildingsByCompanyStatement.execute({params: [data]});

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    //const returnedBuildings: BuildingResponse[] =  parser.parseBuildingResponse(result.rows);
    return {status: 200, message: `Returned ${result.rows?.length} charging types`, error: null, data: {'Result': result}};
}

export default {
    createReservation,
    getAllReservations,
    cancelReservation,
    editReservation,
    getAllTypesAtBuilding
};
