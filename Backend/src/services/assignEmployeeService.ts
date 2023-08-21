import { DataTypeOIDs, QueryResult } from "postgresql-client";
import parser from "../models/modelParser";
import db from '.././utils/database';
import { APIResponse } from "../models/requestModels";

async function assignToCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignRequest(body);
    } catch (error) {
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `UPDATE accounts SET company_id = $1
        WHERE id = $2;`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
    );

    let result: QueryResult;
    try {
        result = await statement.execute({params: [data.otherID, data.userID]});
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_18')) errorMessage = 'This companyID does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 2';
                return {status: 400, data: {'Error': errorMessage}};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number != 1) return {status: 400, data: {'Error': "Could not assign company to user, check if the userID is correct."}};

    return ({status: 200, data: {'Result:': 'Successfully added new employee to company.'}});
}

async function assignToBuilding(body: unknown) {
    let data;
    try {
        data = parser.parseAssignEmployeeToBuildingRequest(body);
    } catch (error) {
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `INSERT INTO Building_accesses (account_id, building_id, company_admin_id)
        VALUES ($1, $2, $3);`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
    );

    let result: QueryResult;
    try {
        result = await statement.execute({params: [data.userID, data.buildingID, data.companyAdminID]});
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_8')) errorMessage = 'This userID does not exist';
                else if (error.message.includes('fk_9')) errorMessage = 'This buildingID does not exist';
                else if (error.message.includes('fk_10')) errorMessage = 'This companyAdminID does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 3';
                return {status: 400, data: {'Error': errorMessage}};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1) throw new Error("Something went wrong while trying to assign user to building.");

    return ({status: 200, data: {'Result:': 'Successfully added new user to building.'}});
}

export default {
    assignToCompany,
    assignToBuilding
};