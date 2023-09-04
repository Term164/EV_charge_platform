import { UserAccount } from "./databaseModels";
import { AssignCompanyRequest, AssignEmployeeToBuildingRequest, AssignRequest, CreateBuildingRequest, CreateCompanyRequest, DeleteBuildingRequest, DeleteCompanyRequest, EditBuildingRequest, EditCompanyRequest, UserLoginRequest, UserRegistrationRequest, UserVerificationRequest } from "./requestModels";

// ================================== TYPE CHECKER FUNCTIONS ==============================

function isString(text: unknown): text is string {
    return typeof text === 'string' || text instanceof String;
}

function isInt(number: unknown): number is number {
    return typeof number === 'number' || number instanceof Number;
}

function isBool (booleanValue: unknown): booleanValue is boolean {
    return typeof booleanValue === 'boolean' || booleanValue instanceof Boolean;
}

function parseIntegerParameter(param: unknown, paramName: string): number {
    if (!param || !isInt(param)) {
        throw new Error(`Incorrect or missing ${paramName}`);
    }

    return param;
}

function parseIntegerParameterFromString(param: unknown, paramName: string): number {
    if (!param || !isString(param)) {
        throw new Error(`Incorrect or missing ${paramName}`);
    }

    return Number.parseInt(param);
}

function parseStringParameter(param: unknown, paramName: string): string {
    if (!param || !isString(param)) {
        throw new Error(`Incorrect or missing ${paramName}`);
    }

    return param;
}

function parseBooleanParameter(param: unknown, paramName: string): boolean {
    if (param === null || !isBool(param)) {
        throw new Error(`Incorrect or missing ${paramName}`);
    }

    return param;
}

// ==================================== REQUEST MODEL PARSERS ========================================

function parseUserRegistrationRequest(request: unknown): UserRegistrationRequest {

    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('username' in request && 'email_account' in request && 'password' in request) {
        const userRequest: UserRegistrationRequest = {
            username: parseStringParameter(request.username, 'username'),
            email_account: parseStringParameter(request.email_account, 'email_account'),
            password: parseStringParameter(request.password, 'password')
        };

        return userRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseUserVerificationRequest(request: unknown): UserVerificationRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('id' in request && 'token' in request) {
        const userRequest: UserVerificationRequest = {
            id: parseIntegerParameter(Number(request.id), 'id'),
            token: parseStringParameter(request.token, 'token'),
        };

        return userRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

function parseUserLoginRequest(request: unknown): UserLoginRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('username' in request && 'password' in request) {
        const userRequest: UserLoginRequest = {
            username: parseStringParameter(request.username, 'username'),
            password: parseStringParameter(request.password, 'password')
        };

        return userRequest;
    } else if ('email' in request && 'password' in request) {
        const userRequest: UserLoginRequest = {
            email: parseStringParameter(request.email, 'email'),
            password: parseStringParameter(request.password, 'password')
        };

        return userRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

function parseAssignRequest(request: unknown): AssignRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('userID' in request && 'companyID' in request) {
        const assignRequest: AssignRequest = {
            userID: parseIntegerParameterFromString(request.userID, 'userID'),
            otherID: parseIntegerParameterFromString(request.companyID, 'companyID')
        };

        return assignRequest;
    } else if ('userID' in request && 'buildingID' in request) {
        const assignRequest: AssignRequest = {
            userID: parseIntegerParameterFromString(request.userID, 'userID'),
            otherID: parseIntegerParameterFromString(request.buildingID, 'buildingID')
        };

        return assignRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

function parseCreateCompanyRequest(request: unknown): CreateCompanyRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('companyName' in request) {
        const CreateCompanyRequest: CreateCompanyRequest = {
            companyName: parseStringParameter(request.companyName, 'companyName')
        };

        return CreateCompanyRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

function parseDeleteCompanyRequest(request: unknown): DeleteCompanyRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('companyID' in request) {
        const DeleteCompanyRequest: DeleteCompanyRequest = {
            companyID: parseIntegerParameter(request.companyID, 'companyID')
        };

        return DeleteCompanyRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

function parseEditCompanyRequest(request: unknown): EditCompanyRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('companyID' in request && 'newCompanyName' in request) {
        const EditCompanyRequest: EditCompanyRequest = {
            companyID: parseIntegerParameter(request.companyID, 'companyID'),
            newCompanyName: parseStringParameter(request.newCompanyName, 'newCompanyName')
        };

        return EditCompanyRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

function parseAssignEmployeeToBuildingRequest(request: unknown): AssignEmployeeToBuildingRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('userID' in request && 'buildingID' in request && 'companyAdminID' in request) {
        const assignRequest: AssignEmployeeToBuildingRequest = {
            userID: parseIntegerParameterFromString(request.userID, 'userID'),
            buildingID: parseIntegerParameterFromString(request.buildingID, 'buildingID'),
            companyAdminID: parseIntegerParameterFromString(request.companyAdminID, 'companyAdminID'),
            expirationDate: 'expirationDate' in request ? new Date(request.expirationDate as string) : undefined
        };

        return assignRequest;
    }

    throw new Error('Incorrect data: some fields are missing');

}

function parseCreateBuildingRequest(request: unknown): CreateBuildingRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('buildingName' in request && 'buildingLocation' in request) {
        const CreateBuildingRequest: CreateBuildingRequest = {
            buildingName: parseStringParameter(request.buildingName, 'buildingName'),
            buildingLocation: parseStringParameter(request.buildingLocation, 'buildingLocation')
        };

        return CreateBuildingRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

function parseEditBuildingRequest(request: unknown): EditBuildingRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('buildingID' in request) {
        const EditBuildingRequest: EditBuildingRequest = {
            buildingID: parseIntegerParameter(request.buildingID, 'buildingID'),
            newBuildingName : ('newBuildingName' in request) ? parseStringParameter(request.newBuildingName, 'newBuildingName') : null,
            newBuildingLocation : ('newBuildingLocation' in request) ? parseStringParameter(request.newBuildingLocation, 'newBuildingLocation') : null
        };

        return EditBuildingRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

function parseDeleteBuildingRequest(request: unknown): DeleteBuildingRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('buildingID' in request) {
        const DeleteBuildingRequest: DeleteBuildingRequest = {
            buildingID: parseIntegerParameter(request.buildingID, 'buildingID')
        };

        return DeleteBuildingRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

function parseAssignCompanyRequest(request: unknown): AssignCompanyRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('buildingID' in request && 'companyID' in request) {
        const AssignCompanyRequest: AssignCompanyRequest = {
            buildingID: parseIntegerParameter(request.buildingID, 'buildingID'),
            companyID: parseIntegerParameter(request.companyID, 'companyID'),
        };

        return AssignCompanyRequest;
    }

    throw new Error('Incorrect data: some fields are missing');
}

// ==================================== DATABASE MODEL PARSERS ==============================================

function parseUserAccountData(data: unknown): UserAccount {
    if (!data) {
        throw new Error('Incorrect or missing data');
    }

    if (!Array.isArray(data)) throw new Error('Incorrect data format: User account data should be passed as an array');

    const userAccount: UserAccount = {
        id: parseIntegerParameter(data[0], 'id'),
        username: parseStringParameter(data[1], 'username'),
        password_hash: parseStringParameter(data[2], 'password_hash'),
        email_account: parseStringParameter(data[3], 'email_account'),
        validated: parseBooleanParameter(data[4], 'validated'),
        profile_picture: data[5] === null ? undefined : parseStringParameter(data[5], 'profile_picture'),
        rfid: data[6] === null ? undefined : parseIntegerParameter(data[6], 'rfid'),
        company_id: data[7] === null ? undefined : parseIntegerParameter(data[7], 'company_id')
    };

    return userAccount;
}

export default {
    parseUserRegistrationRequest,
    parseUserVerificationRequest,
    parseUserLoginRequest,
    parseAssignRequest,
    parseAssignEmployeeToBuildingRequest,
    parseUserAccountData,
    parseCreateCompanyRequest,
    parseDeleteCompanyRequest,
    parseEditCompanyRequest,
    parseCreateBuildingRequest,
    parseEditBuildingRequest,
    parseDeleteBuildingRequest,
    parseAssignCompanyRequest
};