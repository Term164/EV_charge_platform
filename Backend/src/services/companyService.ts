import { APIResponse } from "../models/requestModels";
import parser from "../models/modelParser";
import log from "../utils/logger";
import { SQLStatementManager } from "../utils/SQLStatementManager";

// ======================================== MAIN FUNCTIONS ========================================

async function createCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseCreateCompanyRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const result = await SQLStatementManager.createCompanyStatement.execute({params: [data.companyName]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to create a new company.");

    return ({status: 200, data: {'Result': 'Successfully added new company.'}});
}

async function getAllCompanies(): Promise<APIResponse> {

    const result = await SQLStatementManager.getAllCompaniesStatment.execute({params: []});

    return ({status: 200, data: {'Result': result.rows}});
}

async function deleteCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseDeleteCompanyRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const result = await SQLStatementManager.deleteCompanyStatement.execute({params: [data.companyID]});

    if (result.rowsAffected != 1) //throw new Error("Something went wrong while trying to delete a company.");
        return {status: 400, data: {'Error': 'Failed to delete a company.'}};
    return ({status: 200, data: {'Result': 'Successfully deleted a company.'}});
}

async function editCompany(body: unknown): Promise<APIResponse> {
    let data;
    try {
        data = parser.parseEditCompanyRequest(body);
    } catch (error) {
        log.debug(error);
        return {status: 400, data: {'Error': 'Incorrect data in request'}};
    }

    const result = await SQLStatementManager.editCompanyStatement.execute({params: [data.newCompanyName, data.companyID]});

    if (result.rowsAffected != 1) throw new Error("Something went wrong while trying to edit a company.");

    return ({status: 200, data: {'Result': 'Successfully updated a company.'}});
}

export default {
    createCompany,
    getAllCompanies,
    deleteCompany,
    editCompany
};