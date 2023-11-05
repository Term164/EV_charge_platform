import { UserAccount, building, buildingAdmin, company, companyAdmin } from "./databaseModels";
import { AssignStationToCompanyRequest, AssignEmployeeToBuildingRequest, AssignRequest, CreateChargingTypeRequest, CreateCompanyRequest, CreateStationRequest, DeleteCompanyRequest, DeleteChargingTypeRequest, EditCompanyRequest, DeleteStationRequest, EditUserProfileRequest, EditChargingTypeRequest, RevokeBuildingAccessRequest, EditStationRequest, GetAllAvailableStationsRequest, GetAllStationsRequest, UserLoginRequest, UserRegistrationRequest, UserVerificationRequest, CreateBuildingRequest, EditBuildingRequest, DeleteBuildingRequest, AssignCompanyRequest, ChargingConnectorForCreateStationRequest } from "./requestModels";
import { BuildingResponse, ChargingConnectorResponse, ChargingStationResponse, ChargingTypeResponse, CompanyResponse } from "./responseModels";

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

function parseDeleteBuildingAccessRequest(request: unknown): RevokeBuildingAccessRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('userID' in request && 'buildingID' in request) {
        const revokeRequest: RevokeBuildingAccessRequest = {
            userID: parseIntegerParameterFromString(request.userID, 'userID'),
            buildingID: parseIntegerParameterFromString(request.buildingID, 'buildingID'),
        };

        return revokeRequest;
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

function parseEditUserProfileRequest(request: unknown): EditUserProfileRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('userID' in request) {
        const userEditData: EditUserProfileRequest = {
            id: parseIntegerParameterFromString(request.userID, 'userID'),
            username: 'username' in request ? parseStringParameter(request.username, 'username') : undefined,
            email_account: 'email_account' in request ? parseStringParameter(request.email_account, 'email_account') : undefined,
            profile_picture: 'profile_picture' in request ? undefined : undefined, //TODO: find out how to parse pfp
            rfid: 'rfid' in request ? parseIntegerParameterFromString(request.rfid,'rfid') : undefined,
            company_id: 'companyID' in request ? parseIntegerParameterFromString(request.companyID, 'companyID') : undefined
        };

        return userEditData;
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

// ==================================== SINGLE VARIABLE PARSERS ======================================

function parseUserID(dataBody: unknown): number {
    if (!dataBody || typeof dataBody !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('userID' in dataBody) {
        return parseIntegerParameterFromString(dataBody.userID, 'userID');
    } else {
        throw new Error('Incorrect data: some fields are missing');
    }
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

function parseGetAllStationsRequest(request: unknown): GetAllStationsRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    const GetAllStationsRequest: GetAllStationsRequest = {
        buildingID : ('buildingID' in request) ? parseIntegerParameter(request.buildingID, 'buildingID') : null
    };
    return GetAllStationsRequest;
}

function IsChargingConnectorsForCreateStationRequestCorrectlyFormatted(arrayOfConnectors: unknown): boolean{
    if (!arrayOfConnectors || Array.isArray(arrayOfConnectors))
        return false;

    for (let i = 0; i < (arrayOfConnectors as any[]).length; i++) {
        if (!('chargingTypeID' in (arrayOfConnectors as any[])[i]))
            return false;
        if (!isInt((arrayOfConnectors as any[])[i].chargingTypeID) )
            return false;
    }
    return true;
}

function parseCreateStationRequest(request: unknown): CreateStationRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('buildingID' in request && 'stationName' in request && 'chargingConnectors' in request) {
        let CreateStationRequest: CreateStationRequest = {
            buildingID: parseIntegerParameter(request.buildingID, 'buildingID'),
            stationName: parseStringParameter(request.stationName, 'stationName'),
            chargingConnectors: []
        };
        if (!IsChargingConnectorsForCreateStationRequestCorrectlyFormatted(request.chargingConnectors))
            throw new Error('Incorrect data in chargingConnectors: must be array of numbers');
        
        CreateStationRequest.chargingConnectors = request.chargingConnectors as ChargingConnectorForCreateStationRequest[];

        return CreateStationRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseDeleteStationRequest(request: unknown): DeleteStationRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('stationID' in request) {
        const DeleteStationRequest: DeleteStationRequest = {
            stationID: parseIntegerParameter(request.stationID, 'stationID')
        };

        return DeleteStationRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseAssignStationToCompanyRequest(request: unknown): AssignStationToCompanyRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('stationID' in request && 'companyID' in request) {
        const AssignStationToCompanyRequest: AssignStationToCompanyRequest = {
            stationID: parseIntegerParameter(request.stationID, 'stationID'),
            companyID: request.companyID != null ? parseIntegerParameter(request.companyID, 'companyID') : null
        };

        return AssignStationToCompanyRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseEditStationRequest(request: unknown): EditStationRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('stationID' in request) {
        const EditStationRequest: EditStationRequest = {
            stationID: parseIntegerParameter(request.stationID, 'stationID'),
            newTypeID : ('newTypeID' in request) ? parseIntegerParameter(request.newTypeID, 'newTypeID') : null,
            newBuildingID : ('newBuildingID' in request) ? parseIntegerParameter(request.newBuildingID, 'newBuildingID') : null,
            newStationName : ('newStationName' in request) ? parseStringParameter(request.newStationName, 'newStationName') : null
        };

        return EditStationRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

// Spot for 'get all available for user'
//

function parseCreateChargingTypeRequest(request: unknown): CreateChargingTypeRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('chargingType' in request) {
        const CreateChargingTypeRequest: CreateChargingTypeRequest = {
            chargingType: parseStringParameter(request.chargingType, 'chargingType')
        };

        return CreateChargingTypeRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseDeleteChargingTypeRequest(request: unknown): DeleteChargingTypeRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('chargingTypeID' in request) {
        const DeleteChargingTypeRequest: DeleteChargingTypeRequest = {
            chargingTypeID: parseIntegerParameter(request.chargingTypeID, 'chargingTypeID')
        };

        return DeleteChargingTypeRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseEditChargingTypeRequest(request: unknown): EditChargingTypeRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('chargingTypeID' in request && 'newChargingType' in request) {
        const EditChargingTypeRequest: EditChargingTypeRequest = {
            chargingTypeID: parseIntegerParameter(request.chargingTypeID, 'chargingTypeID'),
            newChargingType: parseStringParameter(request.newChargingType, 'newChargingType')
        };

        return EditChargingTypeRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseGetAllAvailableStationsRequest(request: unknown): GetAllAvailableStationsRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('userID' in request) {
        const GetAllAvailableStationsRequest: GetAllAvailableStationsRequest = {
            userID: parseIntegerParameter(request.userID, 'userID')
        };

        return GetAllAvailableStationsRequest;
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
        profile_picture: data[5] === null ? undefined : parseStringParameter('TODO', 'profile_picture'),
        rfid: data[6] === null ? undefined : parseIntegerParameter(data[6], 'rfid'),
        company_id: data[7] === null ? undefined : parseIntegerParameter(data[7], 'company_id')
    };

    return userAccount;
}

function parseBuildingData(data: unknown): building {
    if (!data) {
        throw new Error('Incorrect or missing data');
    }

    if (!Array.isArray(data)) throw new Error('Incorrect data format: Building data should be passed as an array');

    const buildingData: building = {
        id: parseIntegerParameter(data[0], 'id'),
        building_name: parseStringParameter(data[1], 'building_name'),
        building_location: parseStringParameter(data[2], 'building_location')
    };

    return buildingData;
}

function parseCompanyData(data: unknown): company {
    if (!data) {
        throw new Error('Incorrect or missing data');
    }

    if (!Array.isArray(data)) throw new Error('Incorrect data format: Building data should be passed as an array');

    const companyData: company = {
        id: parseIntegerParameter(data[0], 'id'),
        company_name: parseStringParameter(data[1], 'company_name'),
    };

    return companyData;
}

function parseBuildingAdmin(data: unknown) {
    if (!data) {
        throw new Error('Incorrect or missing data');
    }

    if (!Array.isArray(data)) throw new Error('Incorrect data format: Building data should be passed as an array');

    const buildingAdminData: buildingAdmin = {
        account: parseUserAccountData(data.slice(0, 8)),
        building: parseBuildingData(data.slice(8,data.length))
    };

    return buildingAdminData;
}

function parseCompanyAdmin(data: unknown) {
    if (!data) {
        throw new Error('Incorrect or missing data');
    }

    if (!Array.isArray(data)) throw new Error('Incorrect data format: Building data should be passed as an array');

    const companyAdminData: companyAdmin = {
        account: parseUserAccountData(data.slice(0, 8)),
        company: parseCompanyData(data.slice(8,data.length))
    };

    return companyAdminData;
}

// ==================================== RESPONSE MODEL PARSERS ==============================================
function parseBuildingResponse(rows: any[]): BuildingResponse[] {
    let returningArray: BuildingResponse[] = new Array(rows.length);
    let building: BuildingResponse;
    for (let i = 0; i < rows.length; i++) {
        building = new BuildingResponse();
        building.buildingID = rows[i][0];
        building.buildingName = rows[i][1];
        building.buildingLocation = rows[i][2];
        returningArray[i] = building;
    }
    return returningArray;
}

function parseCompanyResponse(rows: any[]): CompanyResponse[] {
    let returningArray: CompanyResponse[] = new Array(rows.length);
    let company: CompanyResponse;
    for (let i = 0; i < rows.length; i++) {
        company = new CompanyResponse();
        company.companyID = rows[i][0];
        company.companyName = rows[i][1];
        returningArray[i] = company;
    }
    return returningArray;
}

function parseChargingTypeResponse(rows: any[]): ChargingTypeResponse[] {
    let returningArray: ChargingTypeResponse[] = new Array(rows.length);
    let chargingType: ChargingTypeResponse;
    for (let i = 0; i < rows.length; i++) {
        chargingType = new ChargingTypeResponse();
        chargingType.chargingTypeID = rows[i][0];
        chargingType.chargingType = rows[i][1];
        returningArray[i] = chargingType;
    }
    return returningArray;
}

function parseChargingStationResponse(rows: any[], specific: boolean): ChargingStationResponse[] {
    let processedStations = new Map;
    let returningArray: ChargingStationResponse[] = [];
    for (let i = 0; i < rows.length; i++) {
        // Get station ID and Connector ID first for comparing
        let station = new ChargingStationResponse;
        station.chargingStationID = rows[i][1];

        let connector = new ChargingConnectorResponse;
        connector.chargingConnectorID = rows[i][0];

        let type = new ChargingTypeResponse;
        type.chargingTypeID = rows[i][3];
        type.chargingType = rows[i][4];
        
        connector.chargingType = type;

        // If it has been processed, then simply add the connector to the 
        // original station, using the value from map as index
        if (processedStations.has(station.chargingStationID)) {
            let index = processedStations.get(station.chargingStationID);
            returningArray[index].chargingConnectors.push(connector);
            continue;
        }
        
        // If station ID hasn't been processed yet, add it along with its
        // index in the returning array
        processedStations.set(station.chargingStationID, returningArray.length);

        station.chargingStationName = rows[i][2];    
        station.chargingConnectors = [];
        station.chargingConnectors.push(connector);

        if (specific){
            station.building = null;
        } else {
            station.building = {} as BuildingResponse;
            station.building.buildingID = rows[i][5];
            station.building.buildingName = rows[i][6];
            station.building.buildingLocation = rows[i][7];
        }
        if (rows[i][8] == null){
            station.company = null;
        } else {
            station.company = {} as CompanyResponse;
            station.company.companyID = rows[i][8];
            station.company.companyName = rows[i][9];
        }
        
        returningArray.push(station);
    }
    return returningArray;
}


export default {
    parseIntegerParameterFromString,
    parseUserRegistrationRequest,
    parseUserVerificationRequest,
    parseUserLoginRequest,
    parseAssignRequest,
    parseAssignEmployeeToBuildingRequest,
    parseDeleteBuildingAccessRequest,
    parseEditUserProfileRequest,
    parseUserAccountData,
    parseCreateCompanyRequest,
    parseDeleteCompanyRequest,
    parseEditCompanyRequest,
    parseBuildingAdmin,
    parseCompanyAdmin,
    parseUserID,
    parseCreateBuildingRequest,
    parseEditBuildingRequest,
    parseDeleteBuildingRequest,
    parseAssignCompanyRequest,
    parseGetAllStationsRequest,
    parseCreateStationRequest,
    parseDeleteStationRequest,
    parseAssignStationToCompanyRequest,
    parseEditStationRequest,
    parseCreateChargingTypeRequest,
    parseDeleteChargingTypeRequest,
    parseEditChargingTypeRequest,
    parseGetAllAvailableStationsRequest,
    // -----------------------
    parseBuildingResponse,
    parseCompanyResponse,
    parseChargingTypeResponse,
    parseChargingStationResponse,
    
};