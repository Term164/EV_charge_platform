import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import log from "../utils/logger";
import { SQLStatementManager } from "../utils/SQLStatementManager";
import { reservation } from "../models/databaseModels";
import { CreatedReservationInfo } from "../models/responseModels";

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
    const result = await SQLStatementManager.createReservationStatement.execute({
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
        successMessage = 'No slots found. Successfully queued.';
    else
        successMessage = 'Partially created a reservation. Successfully queued.';
    return {status: 200, message: successMessage, error: null, data: {'Result':returnedReservationInfo}};
}

async function getAllReservationsForPerson(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseUserID(body);
    } catch (error) {
        log.debug(data, error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.getAllReservationsForPersonStatement.execute({params: [data],
        objectRows: true,
        utcDates: true
    });

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    return {status: 200, message: `Returned ${result.rows?.length} reservations`, error: null, data: {'Result': result.rows}};
}

//* Only for BAdmins
async function getAllReservationsForBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseBuildingID(body);
    } catch (error) {
        log.debug(data, error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.getAllReservationsForBuildingStatement.execute({params: [data],
        objectRows: true,
        utcDates: true
    });

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    return {status: 200, message: `Returned ${result.rows?.length} reservations`, error: null, data: {'Result': result.rows}};
}

async function getSpecificReservation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseReservationID(body);
    } catch (error) {
        log.debug(data, error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.getSpecificReservationStatement.execute({params: [data],
        objectRows: true,
        utcDates: true
    });

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    if (result.rows.length == 0)
        return {status: 404, message: "Reservation not found.", error: "Reservation with that ID does not exist.", data: null};
    const returnedReservation: reservation =  parser.parseReservationDatabaseModel(result.rows?.at(0));
    return {status: 200, message: `Returned ${result.rows?.length} reservations`, error: null, data: {'Result': returnedReservation}};
}

/*******************************************
 * When somebody cancels a reservation, or edits it;
 * appropriate function is called and returns a list of "new" reservations - 
 * everyone in queue is checked for a slot.
 * The returned info is actually not important for anything (the changes are made and can
 * be viewed anytime by "get reservations"), other than for NOTIFICATIONS.
 * 
 * When notifications will be implemented, this info is to be used.
 * It has:
 * accountID, allocatedConnectorID, allocatedFrom, allocatedTo, chargingTime & positionInQueue
 * Out of these variables, one can logically deduct what type of notification is sent.
 * * If allocatedConnectorID is null (user is completely queued), then send
 * something like "No slots were found. You are Nth in queue."
 * * If allocatedConnectorID is not null and positionInQueue is not null (partially queued),
 * then send "You were allocated a slot from $(allocatedFrom) to $(allocatedTo). 
 *  Since this isn't your complete reservation, you are still Nth in queue."
 * * Else (allocatedConnectorID not null, positionInQueue null, completely reserved), send
 * something like "You have successfully reserved a slot from $(allocatedFrom) to $(allocatedTo)."
********************************************
*/
async function cancelReservation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseReservationID(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.cancelReservationStatement.execute({params: [data],
        utcDates:true,
        objectRows: true
    });
    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    const returnedInfo: CreatedReservationInfo[] =  parser.parseArrayOfReportsAboutReservationCreation(result.rows);
    if (returnedInfo.length == 0)
        return {status: 200, message: `Nothing received since probably nothing changed.`, error: null, data: null};

    //* Notifiy people from here
    // Frontend has to filter out which info is for logged in user (if any)
    // Or can backend return appropriate info? But how do i know who is logged in? With sessionID? How do i get sessionID?

    return {status: 200, message: `Returned ${result.rows?.length} reports of reservation creation/modification`, error: null, data: {'Result': returnedInfo}};
}

async function editReservation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditReservationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.editReservationStatement.execute({params: [data.reservationID, data.desiredFrom, data.desiredTo, data.chargingTime, data.desiredChargingTypeID],
        utcDates: true,
        objectRows: true
    });
    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};
    const returnedInfo: CreatedReservationInfo[] =  parser.parseArrayOfReportsAboutReservationCreation(result.rows);
    if (returnedInfo.length == 0)
        return {status: 200, message: `Nothing received since probably nothing changed. Check your reservations.`, error: null, data: null};

    //* Notifiy people from here
    // Frontend has to filter out which info is for logged in user (if any)
    // Or can backend return appropriate info? But how do i know who is logged in? With sessionID? How do i get sessionID?

    return {status: 200, message: `Returned ${result.rows?.length} reports of reservation creation/modification`, error: null, data: {'Result': returnedInfo}};
}

async function getAllAvailableChargingTypesAtBuildingForPerson(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteBuildingAccessRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing data', data: {error}};
    }

    const result = await SQLStatementManager.getAllAvailableChargingTypesAtBuildingForPersonStatement.execute({params: [data.userID, data.buildingID]});

    if (result.rows?.at(0)[0].length == 0)
        return {status: 500, message: `Returned 0, either no connectors are available, or there's an error`, error: "Returned 0, either no connectors are available, or there's an error", data: null};
    if (Array.isArray(result.rows?.at(0)[0]))
        return {status: 200, message: `Returned ${result.rows?.at(0)[0].length} charging types`, error: null, data: {'Result': result.rows?.at(0)[0] as Array<number>}};
    else
        return {status: 500, message: `Not an array`, error: "Not an array", data: null};
}

export default {
    createReservation,
    getAllReservationsForPerson,
    getAllReservationsForBuilding,
    getSpecificReservation,
    cancelReservation,
    editReservation,
    getAllAvailableChargingTypesAtBuildingForPerson
};
