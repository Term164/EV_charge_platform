import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import db from '.././utils/database';
import { DataTypeOIDs } from "postgresql-client";
import log from "../utils/logger";

// ======================================== MAIN FUNCTIONS ========================================

async function assignBadmin(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignAdminRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `INSERT INTO Building_admins (account_id, building_id)
        VALUES ($1, $2);
        ON CONFLICT ON CONSTRAINT unique_account_building DO NOTHING;`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
    );

    const result = await statement.execute({params: [data.userID, data.otherID]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to assign new building admin role.");

    return ({status: 200, data: {'Result:': 'Successfully added new building administrator.'}});
}

async function assignCadmin(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignAdminRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `INSERT INTO company_admins (account_id, company_id)
        VALUES ($1, $2)
        ON CONFLICT ON CONSTRAINT unique_account_company DO NOTHING;`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
    );

    const result = await statement.execute({params: [data.userID, data.otherID]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to assign new company admin role.");

    return ({status: 200, data: {'Result:': 'Successfully added new company administrator.'}});
}

export default {
    assignBadmin,
    assignCadmin
};