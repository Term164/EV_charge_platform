import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import log from "../utils/logger";
import { SQLStatementManager } from "../utils/SQLStatementManager";
import { CompanyResponse } from "../models/responseModels";

// ======================================== MAIN FUNCTIONS ========================================

async function createCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCompanyName(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.createCompanyStatement.execute({params: [data]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to create a new company.");

    return ({status: 200, message: 'Successfully added new company.', error: null, data: null});
}

async function getAllCompanies(): Promise<APIResponse> {

    const result = await SQLStatementManager.getAllCompaniesStatment.execute({params: []});

    if (result.rows == undefined)
        return {status: 500, message: `Returned undefined`, error: "Returned undefined", data: result};    
    const returnedCompanies: CompanyResponse[] =  parser.parseCompanyResponse(result.rows);
    return {status: 200, message: `Returned ${result.rows.length} companies`, error: null, data: {'Result': returnedCompanies}};
}

async function getCompanyOfAdmin(requestBody: unknown): Promise<APIResponse> {
    const userID = parser.parseUserID(requestBody);
    const result = await SQLStatementManager.getCompanyOfAdminStatement.execute({params: [userID],
        objectRows: true
    });
    console.log("res:", result);
    if (result.rows == undefined)
        return {status: 500, message: `Could not retrieve company`, error: 'Something went wrong retrieving a company', data: null};    
    return {status: 200, message: `Successfully retrieved a company.`, error: null, data: {"Result": result.rows.at(0)}};
}

async function deleteCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCompanyID(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.deleteCompanyStatement.execute({params: [data]});

    if (result.rowsAffected != 1) //throw new Error("Something went wrong while trying to delete a company.");
        return {status: 400, message: 'Failed to delete a company.', error: 'Returned number of rows affected while deleting a building was not 1.', data: null};
    return ({status: 200, message: 'Successfully deleted a company.', error: null, data: null});
}

async function editCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditCompanyRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, message: 'Incorrect data in request', error: 'Error while parsing user data', data: null};
    }

    const result = await SQLStatementManager.editCompanyStatement.execute({params: [data.newCompanyName, data.companyID]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to edit a company.");

    return ({status: 200, message: 'Successfully updated a company.', error: null, data: null});
}

export default {
    createCompany,
    getAllCompanies,
    deleteCompany,
    editCompany,
    getCompanyOfAdmin
};
