import { Reservation, Status } from '../models/OCPPModels';
import { SQLStatementManager } from '../utils/SQLStatementManager';
import { OCPPLogger } from '../utils/logger';
import parser from '../models/modelParser';
import {
    OcppServer, OcppClientConnection, BootNotificationRequest, BootNotificationResponse, HeartbeatResponse, StatusNotificationRequest, StatusNotificationResponse, HeartbeatRequest, ResetRequest, OcppError, ResetResponse, ReserveNowRequest, ReserveNowResponse, CancelReservationRequest, StartTransactionRequest, StartTransactionResponse, MeterValuesRequest, MeterValuesResponse
} from 'ocpp-ts';

const centralSystem = new OcppServer();
const clientHashMap  = new Map<string, OcppClientConnection>(); // <stationName, connection>
const reservationsHashMap = new Map<string, Reservation>(); // <connectorID, reservationReq>

async function startOCPP(port: number) {
    // First get all connectors then starting listening for stations
    await AssignConnectorsToReservations();
    OCPPLogger.info(`Starting OCPP Central system on port: ${port}`);
    centralSystem.listen(port);
}

async function AssignConnectorsToReservations() {
    const result = await SQLStatementManager.getAllConnectorIDStatement.execute();
    OCPPLogger.info('Getting all connectors from database');
    const connectorList: string[] = parser.parseConnectorIDs(result.rows);
    OCPPLogger.info(`Found ${connectorList.length} connectors and assigned them their reservation objects.`);

    for (let i = 0; i < connectorList.length; i++) {
        reservationsHashMap.set(connectorList[i], {reservationID: i});
    }
}

centralSystem.on('connection', (client: OcppClientConnection) => {

    OCPPLogger.info(`Client ${client.getCpId()} connected`);
    clientHashMap.set(client.getCpId(), client);

    client.on('close', (code: number, reason: Buffer) => {
        OCPPLogger.info(`Client ${client.getCpId()} closed connection`, code, reason.toString());
    });

    // !=================================== BOOT NOTIFICATION ===============================================
    client.on('BootNotification', (request: BootNotificationRequest, cb: (response: BootNotificationResponse) => void) => {
        OCPPLogger.info(`Server got BootNotification`, request);
        const response: BootNotificationResponse = {
            status: 'Accepted',
            interval: 300,
            currentTime: new Date().toISOString(),
        };
        cb(response);
    });

    // !=================================== HEARTBEAT ===============================================
    client.on('Heartbeat', (request: HeartbeatRequest, cb: (response: HeartbeatResponse) => void) => {
        OCPPLogger.info(`Server got HeartbeatRequest`, request);

        const response: HeartbeatResponse = {
            currentTime: new Date().toISOString()
        };

        cb(response);
    });

    // !=================================== STATUS NOTIFICATION ===============================================
    client.on('StatusNotification', (request: StatusNotificationRequest, callback: (response: StatusNotificationResponse) => void) => {
        OCPPLogger.info(`Server got StatusNotification`, request);

        // If the reservation was not claimed for the duration of the reservation
        // The Charge point will send a status notification after the reservation has expired and we update the status in our system.
        if (request.connectorId != 0) {
            const reservation = reservationsHashMap.get(`${client.getCpId()}/${request.connectorId}`);
            if (reservation) {
                if (reservation.status === Status.Reserved && request.status === 'Available') {
                    reservation.status = Status.Finished;
                    reservation.idTag = undefined;
                    reservation.expiryDate = undefined;
                }
            }
        }

        const response: StatusNotificationResponse = {};

        callback(response);
    });

    // !=================================== START TRANSACTION ===============================================
    client.on('StartTransaction', (request: StartTransactionRequest, callback: (response: StartTransactionResponse ) => void) =>{
        OCPPLogger.info(`Server got StartTransactionRequest`, request);

        if (request.reservationId != undefined || request.reservationId != null) {
            const reservation = reservationsHashMap.get(`${client.getCpId()}/${request.connectorId}`);
            console.log(reservation);
            if (!reservation) {
                const response: StartTransactionResponse = {
                    transactionId: 1,
                    idTagInfo: {status: 'Invalid'}
                };
                callback(response);
                return;
            }

            if (reservation.status === Status.Reserved && reservation.reservationID === request.reservationId) {
                reservation.status = Status.Charging;
            }
            console.log(reservation);
        }

        const response: StartTransactionResponse = {
            transactionId: 1,
            idTagInfo: {status:'Accepted'}
        };

        console.log(reservationsHashMap);

        callback(response);
    });

    // !=================================== METER VALUES ===============================================
    client.on('MeterValues', (request: MeterValuesRequest, callback: (response: MeterValuesResponse) => void) => {
        OCPPLogger.info(`Server got MeterValuesRequest from ${request.connectorId}`, request);
        callback({});
    });

});

async function sendResetRequest(clientID: string) {

    const client: OcppClientConnection | undefined = clientHashMap.get(clientID);
    if (client != undefined) {
        try {
            const reset: ResetRequest = {
                type: 'Hard'
            };
            const resetResp: ResetResponse = await client.callRequest('Reset', reset);
            if (resetResp.status === 'Accepted') OCPPLogger.info(`Charging station with id ${client.getCpId()} is restarting.`);
        } catch (e) {
            if (e instanceof Error || e instanceof OcppError) {
                console.error(e.message);
            }
        }
    }
}

async function sendReservationRequest(clientID: string, conID: number, finishDate: string, tag: string ) {
    const client = clientHashMap.get(clientID);
    if (client != undefined) {
        try {
            const reservation = reservationsHashMap.get(`${clientID}/${conID}`);
            if (!reservation) return; // Check if reservation object exists

            if (reservation.status === Status.Charging) { // Check if the previous reservation has finished
                // If it has not then skip trying to make a reservation and assign the next reservation to the nextReservation variable
                reservation.nextReservation = {
                    reservationID: reservation.reservationID,
                    expiryDate: finishDate,
                    idTag: tag,
                    status: Status.Reserved
                };
                return;
            }

            // Construct new Reservation request to send to the charging station
            const reservationReq: ReserveNowRequest = {
                connectorId: conID,
                expiryDate: finishDate,
                idTag: tag,
                reservationId: reservation.reservationID
            };

            const reservationResp: ReserveNowResponse = await client.callRequest('ReserveNow', reservationReq);
            OCPPLogger.info(`Charging point with id ${client.getCpId()} responded with ${reservationResp.status} to ReserveNowRequest`);

            if (reservationResp.status === 'Accepted') {
                // Update the reservation information in the reservation object
                reservation.idTag = tag;
                reservation.expiryDate = finishDate;
                reservation.status = Status.Reserved;
            }
        } catch (e) {
            if (e instanceof Error || e instanceof OcppError) {
                console.error(e.message);
            }
        }
    }
}

async function sendCancleReservationRequest(clientID: string) {
    const client: OcppClientConnection | undefined = clientHashMap.get(clientID);
    if (client != undefined) {
        try {
            const cancleReservation: CancelReservationRequest = {
                reservationId: 1
            };
            const reservationResp: ReserveNowResponse = await client.callRequest('CancelReservation', cancleReservation);
            OCPPLogger.info(`Charging point with id ${client.getCpId()} responded with ${reservationResp.status} to CancleReservationRequest`);

        } catch (e) {
            if (e instanceof Error || e instanceof OcppError) {
                console.error(e.message);
            }
        }
    }
}

export default centralSystem;
export { clientHashMap, sendResetRequest, sendReservationRequest, sendCancleReservationRequest, startOCPP };