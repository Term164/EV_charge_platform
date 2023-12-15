import cron from 'node-cron';
import log from './logger';
import { SQLStatementManager } from './SQLStatementManager';
import modelParser from '../models/modelParser';
import { ReservationData } from '../models/OCPPModels';
import { sendReservationRequest } from '../Ocpp-Central/CentralSystem';

function startCronJobs () {
    log.info('Started hourly reservation cron job.');
    cron.schedule('0 * * * *', () => {
        log.info('Getting all reservations for ' + new Date().toLocaleTimeString());
        getCurrentReservations()
            .then((reservationList) => {
                log.info(`Found ${reservationList.length} reservations for this time, proceeding to reserve connectors.`);
                reserveConnectors(reservationList);
            })
            .catch((error) => {log.error(error);});
    });
}

async function getCurrentReservations() {
    const data = await SQLStatementManager.getAllNextReservationsStatement.execute();
    return modelParser.parseReservationInfo(data.rows);
}

function reserveConnectors(reservationList: ReservationData[]) {
    for (const reservation of reservationList) {
        void sendReservationRequest(reservation.stationID, reservation.connectorID, reservation.expiryDate.toISOString(), reservation.idTag);
    }
}

export {startCronJobs};


//*DONE: get all required parameters to make a reservation on OCPP from SQL database
//*DONE: Before starting the OCPP Central system query the database for all the connectors and for each one make a reservation object in the hashMap
//*DONE: When making a reservation save the data of the reservation to the coresponding reservation object in the reservationsHashMap
//*DONE: Implement logic on station connections to monitor the status of the connector (Reserved, Charging, FInished)
//*DONE: Implement a cron job that will every full hour try to reserve the connectors with the next client, if that is not possible register a callback function, that will make a reservation once the connector is free
//*DONE: After Central system shutdown reconnect to all stations.
//TODO: Make a hashmap of transaction ids, make a transaction object that has an array of Metered value objects (Check OCPP1.6 for details)