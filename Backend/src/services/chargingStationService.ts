import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import db from '../utils/database';
import { DataTypeOIDs, PreparedStatement, QueryResult } from "postgresql-client";
import log from "../utils/logger";

// ======================================== MAIN FUNCTIONS ========================================

async function createStation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateStationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `INSERT INTO Charging_stations ("charging_type_id", "building_id", "name")
        VALUES ($1, $2, $3);`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric, DataTypeOIDs.varchar]}
    );

    const result = await statement.execute({params: [data.chargingTypeID, data.buildingID, data.stationName]});
    if (result.rowsAffected != 1)
        return {status: 400, data: {"Error":"Something went wrong while trying to create a new station."}};
    return ({status: 200, data: {'Result': 'Successfully added new charging station.'}});
}

async function getAllStations(body: unknown): Promise<APIResponse> {
    let data;
    try {
        //parseDeleteBuildingRequest here, since it parses the same interface -> buildingID
        data = parser.parseGetAllStationsRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }
    let statement, args: unknown[];

    if (data.buildingID) {
        statement = await prepareStatementForSpecificSearch();
        args = [data.buildingID];
    } else {
        statement = await prepareStatementForFullSearch();
        args = [];
    }

    const result = await statement.execute({params: args});
    return ({status: 200, data: {'Result': result.rows}});
}

async function deleteStation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteStationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `DELETE FROM Charging_stations
        WHERE id = $1;`,
        {paramTypes: [DataTypeOIDs.numeric]}
    );

    const result = await statement.execute({params: [data.stationID]});
    if (result.rowsAffected != 1)
        return ({status: 400, data: {'Error': 'Failed to delete a station.'}});
    return ({status: 200, data: {'Result': 'Successfully deleted a station.'}});
}

async function editStation(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditStationRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    // Check 'edit_station' in 'procedures.sql' for info
    const statement = await db.connection.prepare(
        `call edit_station($1, $2, $3, $4);`,
        {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.int4, DataTypeOIDs.int4, DataTypeOIDs.varchar]}
    );

    try {
        await statement.execute({params: [data.stationID, data.newTypeID, data.newBuildingID, data.newStationName]});
    } catch (error: unknown) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Something went wrong. Check your IDs.'}};
    }

    return ({status: 200, data: {'Result': 'Successfully edited a station.'}});
}

// TODO: Research/check the foreign key constraints (and any other)
/** Can also be used to free a station -> companyID=null */
async function assignCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignStationToCompanyRequest(body);
    } catch (error) {
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `UPDATE Charging_stations
        SET company_id = $1
        WHERE id = $2;`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
    );

    let result: QueryResult;
    try {
        result = await statement.execute({params: [data.companyID, data.stationID]});
    } catch (error) {

        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_16')) errorMessage = 'This company does not exist';
                else errorMessage = 'Something went wrong, please contact the site administrators, error code: 1';
                return {status: 400, data: {'Error': errorMessage}};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1)
        return {status: 400, data: {"Error":"Something went wrong while trying to assign station to a company."}};

    return ({status: 200, data: (data.companyID != null) ? {'Result:': 'Successfully assigned station to a company.'}
        : {'Result:': 'Successfully cleared a company reservation for a station.'} });
}

async function getAllAvailableStations(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseGetAllAvailableStationsRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    //* Read get_all_available() sql function from docs
    const statement = await db.connection.prepare(
        `SELECT * FROM get_all_available($1);`,
        {paramTypes: [DataTypeOIDs.int4]}
    );

    const result = await statement.execute({params: [data.userID]});

    return ({status: 200, data: {'Result': result.rows}});
}

// ======================================== HELP FUNCTIONS ========================================

async function prepareStatementForSpecificSearch(): Promise<PreparedStatement> {
    const statement = await db.connection.prepare(
        `SELECT cs.id, name, ct.id type_id, type
        FROM Charging_stations cs JOIN Charging_types ct ON cs.charging_type_id = ct.id JOIN Buildings b ON cs.building_id = b.id
        WHERE b.id = $1;`,
        {paramTypes: [DataTypeOIDs.numeric]}
    );
    return statement;
}

async function prepareStatementForFullSearch(): Promise<PreparedStatement> {
    const statement = await db.connection.prepare(
        `SELECT cs.id, name, ct.id type_id, type, b.id building_id, building_name, building_location
        FROM Charging_stations cs JOIN Charging_types ct ON cs.charging_type_id = ct.id JOIN Buildings b ON cs.building_id = b.id;`,
        {paramTypes: []}
    );
    return statement;
}


export default {
    getAllStations,
    createStation,
    deleteStation,
    assignCompany,
    editStation,
    getAllAvailableStations
};
