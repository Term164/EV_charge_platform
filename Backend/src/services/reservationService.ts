import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import log from "../utils/logger";
import { SQLStatementManager } from "../utils/SQLStatementManager";
import { reservation } from "../models/databaseModels";

// ======================================== MAIN FUNCTIONS ========================================

async function createReservation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateReservationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: (error as Error).message, data: null};
    }
    log.debug("Data is",data);
    const result = await SQLStatementManager.createReservation.execute({
        params: [data.userID, data.desiredBuildingID, data.chargingTime, data.desiredFrom, data.desiredTo, data.desiredChargingTypeID],
        objectRows:true,
        utcDates: true // This is important so dates stay in UTC
    });

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    const returnedReservationInfo = parser.parseReportAboutReservationCreation(result.rows?.at(0));
    let successMessage:string;
    if (returnedReservationInfo.positionInQueue == null)
        successMessage = 'Successfully created a reservation.';
    else if (returnedReservationInfo.allocatedConnectorID == null)
        successMessage = 'Partially created a reservation. Successfully queued.';
    else
        successMessage = 'No slots found. Successfully queued.';
    return {status: 200, message: successMessage, error: null, data: {'Result':returnedReservationInfo}};
}

// TODO
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

async function getSpecificReservation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseReservationID(body);
    } catch (error) {
        log.debug(data, error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.getSpecificReservation.execute({params: [data.reservationID],
        objectRows: true,
        utcDates: true
    });

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    const returnedReservation: reservation =  parser.parseReservationDatabaseModel(result.rows?.at(0));
    return {status: 200, message: `Returned ${result.rows?.length} reservations`, error: null, data: {'Result': returnedReservation}};
}

// TODO
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

// TODO
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

// TODO
async function getAllAvailableChargingTypesAtBuildingForPerson(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteBuildingAccessRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing data', data: {error}};
    }

    const result = await SQLStatementManager.getAllAvailableChargingTypesAtBuildingForPerson.execute({params: [data.userID, data.buildingID]});

    if (result.rows?.at(0)[0].length == 0)
        return {status: 500, message: `Returned 0, either no connectors are available, or there's an error`, error: "Returned 0, either no connectors are available, or there's an error", data: null};
    if (Array.isArray(result.rows?.at(0)[0]))
        return {status: 200, message: `Returned ${result.rows?.at(0)[0].length} charging types`, error: null, data: {'Result': result.rows?.at(0)[0] as Array<number>}};
    else
        return {status: 500, message: `Not an array`, error: "Not an array", data: null};
}

export default {
    createReservation,
    getAllReservations,
    getSpecificReservation,
    cancelReservation,
    editReservation,
    getAllAvailableChargingTypesAtBuildingForPerson
};
