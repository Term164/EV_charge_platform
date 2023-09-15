import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import db from '.././utils/database';
import { DataTypeOIDs, QueryResult } from "postgresql-client";
import log from "../utils/logger";

// ======================================== MAIN FUNCTIONS ========================================

async function createBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `INSERT INTO Buildings (building_name, building_location)
        VALUES ($1, $2);`,
        {paramTypes: [DataTypeOIDs.varchar, DataTypeOIDs.varchar]}
    );

    const result = await statement.execute({params: [data.buildingName, data.buildingLocation]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to create a new building.");

    return ({status: 200, data: {'Result': 'Successfully added new building.'}});
}

async function getAllBuildings(): Promise<APIResponse> {
    const statement = await db.connection.prepare(
        `SELECT * FROM Buildings;`,
        {paramTypes: []}
    );

    const result = await statement.execute({params: []});

    return ({status: 200, data: {'Result': result.rows}});
}

async function deleteBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `DELETE FROM Buildings
        WHERE id = $1;`,
        {paramTypes: [DataTypeOIDs.numeric]}
    );

    const result = await statement.execute({params: [data.buildingID]});

    if (result.rowsAffected != 1) // throw new Error("Something went wrong while trying to delete a building.");
        return ({status: 400, data: {'Error': 'Failed to delete a building.'}});

    return ({status: 200, data: {'Result': 'Successfully deleted a building.'}});
}

async function editBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    // Check 'edit_building' in 'procedures.sql' for info
    const statement = await db.connection.prepare(
        `call edit_building($1, $2, $3);`,
        {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.varchar, DataTypeOIDs.varchar]}
    );

    try {
        const result = await statement.execute({params: [data.buildingID, data.newBuildingName, data.newBuildingLocation]}); //data.buildingID
        log.debug("result: ", result);
    } catch (error: unknown) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Building with given ID not found'}};
    }

    return ({status: 200, data: {'Result': 'Successfully edited a building.'}});
}

async function getAllBuildingsOwnedByCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        //parseDeleteCompanyRequest here, since it parses the same interface -> companyID
        data = parser.parseDeleteCompanyRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `SELECT b.id building_id, building_name, building_location
        FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id 
        JOIN Companies c ON c.id = bc.company_id
        WHERE c.id = $1;`,
        {paramTypes: [DataTypeOIDs.numeric]}
    );

    const result = await statement.execute({params: [data.companyID]});

    return ({status: 200, data: {'Result': result.rows}});
}

async function getAllCompaniesAssignedToBuilding(body: unknown): Promise<APIResponse> {
    let data;
    try {
        //parseDeleteBuildingRequest here, since it parses the same interface -> buildingID
        data = parser.parseDeleteBuildingRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `SELECT c.id company_id, company_name
        FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id 
        JOIN Companies c ON c.id = bc.company_id
        WHERE b.id= $1;`,
        {paramTypes: [DataTypeOIDs.numeric]}
    );

    const result = await statement.execute({params: [data.buildingID]});

    return ({status: 200, data: {'Result': result.rows}});
}

async function assignCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseAssignCompanyRequest(body);
    } catch (error) {
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const statement = await db.connection.prepare(
        `INSERT INTO "Building-Company" (company_id, building_id)
        VALUES ($1, $2)
        ON CONFLICT ON CONSTRAINT unique_building_company DO NOTHING;`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.numeric]}
    );

    let result: QueryResult;
    try {
        result = await statement.execute({params: [data.companyID, data.buildingID]});
    } catch (error) {

        if (error instanceof Error) {
            if (error.message.includes("violates foreign key constraint")) {
                let errorMessage: string;
                if (error.message.includes('fk_6')) errorMessage = 'This building does not exist';
                else if (error.message.includes('fk_7')) errorMessage = 'This company does not exist';
                else errorMessage = 'Something went wrong please contact the site administrators, error code: 1';
                return {status: 400, data: {'Error': errorMessage}};
            }
        }
        throw new Error("Unexpected error occured: " + error);
    }

    if (result.rowsAffected as number > 1) throw new Error("Something went wrong while trying to assign a company to a building.");

    return ({status: 200, data: {'Result:': 'Successfully assigned a company to a building.'}});
}

export default {
    getAllBuildings,
    createBuilding,
    editBuilding,
    deleteBuilding,
    getAllBuildingsOwnedByCompany,
    getAllCompaniesAssignedToBuilding,
    assignCompany
};
