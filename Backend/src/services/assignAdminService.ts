import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import { QueryResult } from "postgresql-client";
import { SQLStatementManager } from "../utils/SQLStatementManager";

// ======================================== MAIN FUNCTIONS ========================================

async function assignBadmin(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignRequest(body);
    } catch (error) {
        return {status: 400, message: 'Incorrect data in request.', error: 'Error while parsing user data' ,data: null};
    }

    let result: QueryResult;
    try {
        result = await SQLStatementManager.assignBadminStatement.execute({params: [data.userID, data.otherID]});
    } catch (error) {

        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_2')) errorMessage = 'This userID does not exist';
                else if (error.message.includes('fk_3')) errorMessage = 'This buildingID does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 1';
                return {status: 400, message: errorMessage, error: error.message, data: null};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1) throw new Error("Something went wrong while trying to assign new building admin role.");

    return ({status: 200, message: 'Successfully added new building administrator.', error: null, data: null});
}

async function assignCadmin(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignRequest(body);
    } catch (error) {
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data.', data: null};
    }

    let result: QueryResult;
    try {
        result = await SQLStatementManager.assignCadminStatement.execute({params: [data.userID, data.otherID]});
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_4')) errorMessage = 'This userID does not exist';
                else if (error.message.includes('fk_5')) errorMessage = 'This companyID does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 2';
                return {status: 400, message: errorMessage, error: error.message, data: null};
            }
        }

        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1) throw new Error("Something went wrong while trying to assign new company admin role.");

    return ({status: 200, message: 'Successfully added new company administrator.' , error: null, data: null});
}

export default {
    assignBadmin,
    assignCadmin
};