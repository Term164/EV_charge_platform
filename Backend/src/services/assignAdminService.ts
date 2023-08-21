import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import db from '.././utils/database';
import { DataTypeOIDs, QueryResult } from "postgresql-client";

// ======================================== MAIN FUNCTIONS ========================================

async function assignBadmin(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignRequest(body);
    } catch (error) {
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `INSERT INTO Building_admins (account_id, building_id)
        VALUES ($1, $2)
        ON CONFLICT ON CONSTRAINT unique_account_building DO NOTHING;`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
    );

    let result: QueryResult;
    try {
        result = await statement.execute({params: [data.userID, data.otherID]});
    } catch (error) {

        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_2')) errorMessage = 'This userID does not exist';
                else if (error.message.includes('fk_3')) errorMessage = 'This buildingID does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 1';
                return {status: 400, data: {'Error': errorMessage}};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1) throw new Error("Something went wrong while trying to assign new building admin role.");

    return ({status: 200, data: {'Result:': 'Successfully added new building administrator.'}});
}

async function assignCadmin(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignRequest(body);
    } catch (error) {
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `INSERT INTO company_admins (account_id, company_id)
        VALUES ($1, $2)
        ON CONFLICT ON CONSTRAINT unique_account_company DO NOTHING;`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
    );

    let result: QueryResult;
    try {
        result = await statement.execute({params: [data.userID, data.otherID]});
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_4')) errorMessage = 'This userID does not exist';
                else if (error.message.includes('fk_5')) errorMessage = 'This companyID does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 2';
                return {status: 400, data: {'Error': errorMessage}};
            }
        }

        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1) throw new Error("Something went wrong while trying to assign new company admin role.");

    return ({status: 200, data: {'Result:': 'Successfully added new company administrator.'}});
}

export default {
    assignBadmin,
    assignCadmin
};