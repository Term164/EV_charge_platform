import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import db from '.././utils/database';
import { DataTypeOIDs } from "postgresql-client";
import log from "../utils/logger";

// ======================================== MAIN FUNCTIONS ========================================

async function createChargingType(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateChargingTypeRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `INSERT INTO charging_types (type)
        VALUES ($1);`,
        {paramTypes: [DataTypeOIDs.varchar]}
    );

    const result = await statement.execute({params: [data.chargingType]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to create a new charging type.");

    return ({status: 200, data: {'Result': 'Successfully added a new charging type.'}});
}

async function getAllChargingTypes(): Promise<APIResponse> {
    const statement = await db.connection.prepare(
        `SELECT * FROM charging_types;`,
        {paramTypes: []}
    );

    const result = await statement.execute({params: []});

    return ({status: 200, data: {'Result': result.rows}});
}

async function deleteChargingType(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteChargingTypeRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `DELETE FROM charging_types
        WHERE id = $1;`,
        {paramTypes: [DataTypeOIDs.numeric]}
    );

    const result = await statement.execute({params: [data.chargingTypeID]});

    if (result.rowsAffected != 1) //throw new Error("Something went wrong while trying to delete a company.");
        return {status: 400, data: {'Error': 'Failed to delete a charging type.'}};
    return ({status: 200, data: {'Result': 'Successfully deleted a charging type.'}});
}

async function editChargingType(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditChargingTypeRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `UPDATE charging_types
        SET type = $1
        WHERE id = $2;`,
        {paramTypes: [DataTypeOIDs.varchar, DataTypeOIDs.numeric]}
    );

    const result = await statement.execute({params: [data.newChargingType, data.chargingTypeID]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to edit a charging type.");

    return ({status: 200, data: {'Result': 'Successfully updated a charging type.'}});
}

export default {
    createChargingType,
    getAllChargingTypes,
    deleteChargingType,
    editChargingType
};