import { ReservationData } from "./OCPPModels";
import { UserAccount, building, buildingAdmin, company, companyAdmin } from "./databaseModels";
import { AssignStationToCompanyRequest, AssignEmployeeToBuildingRequest, AssignRequest, CreateChargingTypeRequest, CreateCompanyRequest, CreateStationRequest, DeleteCompanyRequest, DeleteChargingTypeRequest, EditCompanyRequest, DeleteStationRequest, EditUserProfileRequest, EditChargingTypeRequest, RevokeBuildingAccessRequest, EditStationRequest, GetAllAvailableStationsRequest, GetAllStationsRequest, UserLoginRequest, UserRegistrationRequest, UserVerificationRequest, CreateBuildingRequest, EditBuildingRequest, DeleteBuildingRequest, AssignCompanyRequest, connectorTypeIDAndSerialNumberAndPowerOutput, AddChargingConnectorRequest, ChargingConnectorID, EditChargingConnectorRequest, ConfirmValidationCodeRequest, ResetPasswordRequest } from "./requestModels";
import { BuildingResponse, ChargingConnectorResponse, ChargingStationResponse, ChargingTypeResponse, CompanyResponse } from "./responseModels";

// ================================== TYPE CHECKER FUNCTIONS ==============================

function isString(text: unknown): text is string {
    return typeof text === 'string' || text instanceof String;
}

function isNumber(number: unknown): number is number {
    return typeof number === 'number' || number instanceof Number;
}

function isBool (booleanValue: unknown): booleanValue is boolean {
    return typeof booleanValue === 'boolean' || booleanValue instanceof Boolean;
}

function isDate (dateObject: unknown): dateObject is Date {
    return dateObject instanceof Date;
}

function parseNumberFromString(param: unknown, paramName: string): number {
    if (!param || !isString(param)) {
        throw new Error(`Incorrect or missing ${paramName}`);
    }

    const number = parseInt(param);
    if (!isNaN(number)) return number;
    else throw new Error(`Provided parameter could not be cast to a number.`);
}

function parseNumberParameter(param: unknown, paramName: string): number {
    if (!param || !isNumber(param)) {
        throw new Error(`Incorrect or missing ${paramName}`);
    }

    return param;
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

function parseDateParameter(param: unknown, paramName: string): Date {
    if (param === null || !isDate(param)) {
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
            id: parseNumberParameter(Number(request.id), 'id'),
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
            userID: parseNumberParameter(request.userID, 'userID'),
            otherID: parseNumberParameter(request.companyID, 'companyID')
        };

        return assignRequest;
    } else if ('userID' in request && 'buildingID' in request) {
        const assignRequest: AssignRequest = {
            userID: parseNumberParameter(request.userID, 'userID'),
            otherID: parseNumberParameter(request.buildingID, 'buildingID')
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
            companyID: parseNumberParameter(request.companyID, 'companyID')
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
            companyID: parseNumberParameter(request.companyID, 'companyID'),
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
            userID: parseNumberParameter(request.userID, 'userID'),
            buildingID: parseNumberParameter(request.buildingID, 'buildingID'),
            companyAdminID: parseNumberParameter(request.companyAdminID, 'companyAdminID'),
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
            userID: parseNumberParameter(request.userID, 'userID'),
            buildingID: parseNumberParameter(request.buildingID, 'buildingID'),
        };

        return revokeRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseCreateBuildingRequest(request: unknown): CreateBuildingRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }
    if ('buildingName' in request && 'buildingLocation' in request && 'buildingLongitude' in request && 'buildingLatitude' in request) {
        const CreateBuildingRequest: CreateBuildingRequest = {} as CreateBuildingRequest;
        CreateBuildingRequest.buildingName = parseStringParameter(request.buildingName, 'buildingName');
        CreateBuildingRequest.buildingLocation = parseStringParameter(request.buildingLocation, 'buildingLocation');

        if (request.buildingLongitude == Number(request.buildingLongitude))
            CreateBuildingRequest.buildingLongitude = Number(request.buildingLongitude);
        else
            throw new Error('Incorrect data: longitude must be a floating number');

        if (request.buildingLatitude == Number(request.buildingLatitude))
            CreateBuildingRequest.buildingLatitude = Number(request.buildingLatitude);
        else
            throw new Error('Incorrect data: latitdue must be a floating number');

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
            id: isString(request.userID) ? parseNumberFromString(request.userID, 'userID') : parseNumberParameter(request.userID, 'userID'),
            username: 'username' in request ? parseStringParameter(request.username, 'username') : undefined,
            email_account: 'email_account' in request ? parseStringParameter(request.email_account, 'email_account') : undefined,
            profile_picture: 'profile_picture' in request ? request.profile_picture as Buffer : undefined,
            rfid: 'rfid' in request ? parseStringParameter(request.rfid,'rfid') : undefined,
            company_id: 'companyID' in request ? parseNumberParameter(request.companyID, 'companyID') : undefined
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
            buildingID: parseNumberParameter(request.buildingID, 'buildingID'),
            newBuildingName : ('newBuildingName' in request) ? parseStringParameter(request.newBuildingName, 'newBuildingName') : null,
            newBuildingLocation : ('newBuildingLocation' in request) ? parseStringParameter(request.newBuildingLocation, 'newBuildingLocation') : null,
            newBuildingLongitude : ('newBuildingLongitude' in request) ? parseNumberParameter(request.newBuildingLongitude, 'newBuildingLongitude') : null,
            newBuildingLatitude : ('newBuildingLatitude' in request) ? parseNumberParameter(request.newBuildingLatitude, 'newBuildingLatitude') : null
        };

        return EditBuildingRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseAssignCompanyRequest(request: unknown): AssignCompanyRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('buildingID' in request && 'companyID' in request) {
        const AssignCompanyRequest: AssignCompanyRequest = {
            buildingID: parseNumberParameter(request.buildingID, 'buildingID'),
            companyID: parseNumberParameter(request.companyID, 'companyID'),
        };

        return AssignCompanyRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseCreateStationRequest(request: unknown): CreateStationRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('buildingID' in request && 'stationName' in request && 'chargingConnectors' in request) {
        const CreateStationRequest: CreateStationRequest = {} as CreateStationRequest ;
        CreateStationRequest.buildingID = parseNumberParameter(request.buildingID, 'buildingID');
        CreateStationRequest.stationName = parseStringParameter(request.stationName, 'stationName');

        if (Array.isArray(request.chargingConnectors)) {
            if (request.chargingConnectors.length == 0)
                throw new Error('Incorrect data in connectors array: at least one element must be supplied');
            request.chargingConnectors.forEach(element => {
                if ('chargingTypeID' in element && 'serialNumber' in element) {
                    if (!isNumber((element as connectorTypeIDAndSerialNumberAndPowerOutput).chargingTypeID) ||
                        !isNumber((element as connectorTypeIDAndSerialNumberAndPowerOutput).serialNumber) ||
                        !isNumber((element as connectorTypeIDAndSerialNumberAndPowerOutput).powerOutput)
                    )
                        throw new Error('Incorrect data in connectors array: all elements must be numbers');
                } else
                    throw new Error('Incorrect data in connectors array: must have chargingTypeID, serialNumber and powerOutput');
            });
            CreateStationRequest.chargingConnectors = request.chargingConnectors as connectorTypeIDAndSerialNumberAndPowerOutput[];
            return CreateStationRequest;
        }
        throw new Error('Incorrect data: chargingConnectors must be an array');
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseAssignStationToCompanyRequest(request: unknown): AssignStationToCompanyRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('stationID' in request && 'companyID' in request) {
        const AssignStationToCompanyRequest: AssignStationToCompanyRequest = {
            stationID: parseNumberParameter(request.stationID, 'stationID'),
            companyID: request.companyID != null ? parseNumberParameter(request.companyID, 'companyID') : null
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
            stationID: parseNumberParameter(request.stationID, 'stationID'),
            newBuildingID : ('newBuildingID' in request) ? parseNumberParameter(request.newBuildingID, 'newBuildingID') : null,
            newStationName : ('newStationName' in request) ? parseStringParameter(request.newStationName, 'newStationName') : null
        };

        return EditStationRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseEditChargingTypeRequest(request: unknown): EditChargingTypeRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('chargingTypeID' in request && 'newChargingType' in request) {
        const EditChargingTypeRequest: EditChargingTypeRequest = {
            chargingTypeID: parseNumberParameter(request.chargingTypeID, 'chargingTypeID'),
            newChargingType: parseStringParameter(request.newChargingType, 'newChargingType')
        };

        return EditChargingTypeRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseAddChargingConnectorRequest(request: unknown): AddChargingConnectorRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('stationID' in request && 'chargingConnector' in request) {

        if (!request.chargingConnector || typeof request.chargingConnector !== 'object')
            throw new Error('Incorrect data in chargingConnector');

        if ('chargingTypeID' in request.chargingConnector && 'serialNumber' in request.chargingConnector && 'powerOutput' in request.chargingConnector) {
            const connector: connectorTypeIDAndSerialNumberAndPowerOutput = {
                chargingTypeID: parseNumberParameter(request.chargingConnector.chargingTypeID, 'chargingTypeID'),
                serialNumber: parseNumberParameter(request.chargingConnector.serialNumber, 'serialNumber'),
                powerOutput: parseNumberParameter(request.chargingConnector.powerOutput, 'powerOutput')
            };

            const addChargingConnectorRequest: AddChargingConnectorRequest = {
                stationID: parseNumberParameter(request.stationID, 'stationID'),
                chargingConnector: connector
            };

            return addChargingConnectorRequest;
        }
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseEditChargingConnectorRequest(request: unknown): EditChargingConnectorRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('chargingConnectorID' in request) {
        const EditChargingConnectorRequest: EditChargingConnectorRequest = {
            chargingConnectorID: parseNumberParameter(request.chargingConnectorID, 'chargingConnectorID'),
            chargingTypeID : ('chargingTypeID' in request) ? parseNumberParameter(request.chargingTypeID, 'chargingTypeID') : null,
            serialNumber : ('serialNumber' in request) ? parseNumberParameter(request.serialNumber, 'serialNumber') : null,
            powerOutput: ('powerOutput' in request) ? parseNumberParameter(request.powerOutput, 'powerOutput') : null
        };

        return EditChargingConnectorRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseValidationCodeConfirmationRequest(dataBody: unknown): ConfirmValidationCodeRequest {
    if (!dataBody || typeof dataBody !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('accountID' in dataBody && 'validationCode' in dataBody) {
        const confirmValidationCodeRequest: ConfirmValidationCodeRequest = {
            accountID: parseNumberParameter(dataBody.accountID, 'accountID'),
            validationCode: parseNumberParameter(dataBody.validationCode, 'validationCode')
        };

        return confirmValidationCodeRequest;
    } else {
        throw new Error('Incorrect data: some fields are missing');
    }
}

function parseResetPasswordRequest(dataBody: unknown): ResetPasswordRequest {
    if (!dataBody || typeof dataBody !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('accountID' in dataBody && 'newPassword' in dataBody) {
        const passwordResetRequest: ResetPasswordRequest = {
            accountID: parseNumberParameter(dataBody.accountID, 'accountID'),
            newPassword: parseStringParameter(dataBody.newPassword, 'newPassword')
        };

        return passwordResetRequest;
    } else {
        throw new Error('Incorrect data: some fields are missing');
    }
}


// ==================================== SINGLE VARIABLE PARSERS ======================================

function parseUserID(dataBody: unknown): number {
    if (!dataBody || typeof dataBody !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('userID' in dataBody) {
        return parseNumberParameter(dataBody.userID, 'userID');
    } else {
        throw new Error('Incorrect data: some fields are missing');
    }
}

function parseEmail(dataBody: unknown): string {
    if (!dataBody || typeof dataBody !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('email' in dataBody) {
        return parseStringParameter(dataBody.email, 'email');
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
            buildingID: parseNumberParameter(request.buildingID, 'buildingID')
        };

        return DeleteBuildingRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseGetAllStationsRequest(request: unknown): GetAllStationsRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    const GetAllStationsRequest: GetAllStationsRequest = {
        buildingID : ('buildingID' in request) ? parseNumberParameter(request.buildingID, 'buildingID') : null
    };
    return GetAllStationsRequest;
}

function parseDeleteStationRequest(request: unknown): DeleteStationRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('stationID' in request) {
        const DeleteStationRequest: DeleteStationRequest = {
            stationID: parseNumberParameter(request.stationID, 'stationID')
        };

        return DeleteStationRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

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
            chargingTypeID: parseNumberParameter(request.chargingTypeID, 'chargingTypeID')
        };

        return DeleteChargingTypeRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseGetAllAvailableStationsRequest(request: unknown): GetAllAvailableStationsRequest {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    console.log(request);
    if ('userID' in request) {
        const GetAllAvailableStationsRequest: GetAllAvailableStationsRequest = {
            userID: parseNumberFromString(request.userID, 'userID')
        };

        return GetAllAvailableStationsRequest;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseDeleteChargingConnectorRequest(request: unknown): ChargingConnectorID {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('chargingConnectorID' in request) {
        const ChargingConnectorID: ChargingConnectorID = {
            chargingConnectorID: parseNumberParameter(request.chargingConnectorID, 'chargingConnectorID')
        };

        return ChargingConnectorID;
    }
    throw new Error('Incorrect data: some fields are missing');
}

function parseSessionID(request: unknown): string {
    if (!request || typeof request !== 'object') {
        throw new Error('Incorrect or missing data');
    }

    if ('sessionid' in request) {
        return parseStringParameter(request.sessionid, 'sessionID');
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
        id: parseNumberParameter(data[0], 'id'),
        username: parseStringParameter(data[1], 'username'),
        password_hash: parseStringParameter(data[2], 'password_hash'),
        email_account: parseStringParameter(data[3], 'email_account'),
        validated: parseBooleanParameter(data[4], 'validated'),
        profile_picture: data[5] === null ? undefined : data[5] as Buffer,
        rfid: data[6] === null ? undefined : parseNumberParameter(data[6], 'rfid'),
        company_id: data[7] === null ? undefined : parseNumberParameter(data[7], 'company_id'),
        company_name: data[8] === null || data[8] === undefined ? undefined : parseStringParameter(data[8], 'company_name')
    };

    return userAccount;
}

function parseBuildingData(data: unknown): building {
    if (!data) {
        throw new Error('Incorrect or missing data');
    }

    if (!Array.isArray(data)) throw new Error('Incorrect data format: Building data should be passed as an array');

    const buildingData: building = {
        id: parseNumberParameter(data[0], 'id'),
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
        id: parseNumberParameter(data[0], 'id'),
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

function parseConnectorIDs(data: unknown) {
    if (!data) {
        throw new Error('Incorrect or missing data');
    }

    if (!Array.isArray(data)) throw new Error('Incorrect data format: Connector data should be passed as an array');

    const connectorIDs: string[] = [];

    for (let i = 0; i < data.length; i++) {
        connectorIDs.push(`${data[i][0]}/${data[i][1]}`);
    }

    return connectorIDs;
}

function parseReservationInfo(data: unknown) {
    if (!data) {
        throw new Error('Incorrect or missing data');
    }

    if (!Array.isArray(data)) throw new Error('Incorrect data format: Reservation data should be passed as an array');

    const reservationData: ReservationData[] = [];
    for (let i = 0; i < data.length; i++) {
        const reservation: ReservationData = {
            stationID: parseStringParameter(data[i][0], 'stationID'),
            connectorID: parseNumberParameter(data[i][1], 'connectorID'),
            expiryDate: parseDateParameter(data[i][2], 'expiryDate'),
            idTag: parseStringParameter(data[i][3], 'idTag')
        };

        reservationData.push(reservation);
    }
    return reservationData;
}
// ==================================== RESPONSE MODEL PARSERS ==============================================
function parseBuildingResponse(rows: unknown): BuildingResponse[] {

    if (!Array.isArray(rows)) throw new Error('Incorrect data format: Reservation data should be passed as an array');

    const returningArray: BuildingResponse[] = new Array<BuildingResponse>(rows.length);
    let building: BuildingResponse;
    for (let i = 0; i < rows.length; i++) {
        building = new BuildingResponse();
        building.buildingID = parseNumberParameter(rows[i][0], 'buildingID'); // from sql
        building.buildingName = parseStringParameter(rows[i][1], 'buildingName'); // from sql
        building.buildingLocation = parseStringParameter(rows[i][2], 'buildingLocation'); // from sql
        building.buildingLongitude = Number(rows[i][3]);
        building.buildingLatitude = Number(rows[i][4]);
        returningArray[i] = building;
    }
    return returningArray;
}

function parseCompanyResponse(rows: unknown): CompanyResponse[] {

    if (!Array.isArray(rows)) throw new Error('Incorrect data format: Reservation data should be passed as an array');

    const returningArray: CompanyResponse[] = new Array<CompanyResponse>(rows.length);
    let company: CompanyResponse;
    for (let i = 0; i < rows.length; i++) {
        company = new CompanyResponse();
        company.companyID = parseNumberParameter(rows[i][0], 'companyID'); // from sql
        company.companyName = parseStringParameter(rows[i][1], 'companyName'); // from sql
        returningArray[i] = company;
    }
    return returningArray;
}

function parseChargingTypeResponse(rows: unknown): ChargingTypeResponse[] {

    if (!Array.isArray(rows)) throw new Error('Incorrect data format: Reservation data should be passed as an array');

    const returningArray: ChargingTypeResponse[] = new Array<ChargingTypeResponse>(rows.length);
    let chargingType: ChargingTypeResponse;
    for (let i = 0; i < rows.length; i++) {
        chargingType = new ChargingTypeResponse();
        chargingType.chargingTypeID = parseNumberParameter(rows[i][0], 'chargingTypeID'); // from sql
        chargingType.chargingType = parseStringParameter(rows[i][1], 'chargingType'); // from sql
        returningArray[i] = chargingType;
    }
    return returningArray;
}

function parseChargingStationResponse(rows: unknown, specific: boolean): ChargingStationResponse[] {
    /*
    `SELECT cc.id, cs.id, cs.name as charging_station_name,
                cc.charging_type_id, ct.type as charging_type,
                cs.building_id, building_name, building_location, company_id, company_name, cc.serial_number, cc.power_output, b.longitude, b.latitude
    */
    if (!Array.isArray(rows)) throw new Error('Incorrect data format: Reservation data should be passed as an array');

    const processedStations = new Map<number, number>;
    const returningArray: ChargingStationResponse[] = [];
    for (let i = 0; i < rows.length; i++) {
        // Get station ID and Connector ID first for comparing
        const station = new ChargingStationResponse;
        station.chargingStationID = rows[i][1] as number; // from sql

        const connector = new ChargingConnectorResponse;
        connector.chargingConnectorID = rows[i][0] as number;
        connector.chargingConnectorSerialNumber = rows[i][10] as number;
        connector.chargingConnectorPowerOutput = rows[i][11] as number;

        const type = new ChargingTypeResponse;
        type.chargingTypeID = rows[i][3] as number;
        type.chargingType = rows[i][4] as string;

        connector.chargingType = type;

        // If it has been processed, then simply add the connector to the
        // original station, using the value from map as index
        if (processedStations.has(station.chargingStationID)) {
            const index = processedStations.get(station.chargingStationID) as number;
            returningArray[index].chargingConnectors.push(connector);
            continue;
        }

        // If station ID hasn't been processed yet, add it along with its
        // index in the returning array
        processedStations.set(station.chargingStationID, returningArray.length);

        station.chargingStationName = rows[i][2] as string;
        station.chargingConnectors = [];
        if (rows[i][0] != null)
            station.chargingConnectors.push(connector);

        if (specific) {
            station.building = null;
        } else {
            station.building = {} as BuildingResponse;
            station.building.buildingID = rows[i][5] as number;
            station.building.buildingName = rows[i][6] as string;
            station.building.buildingLocation = rows[i][7] as string;
            station.building.buildingLongitude = rows[i][12] as number;
            station.building.buildingLatitude = rows[i][13] as number;
        }
        if (rows[i][8] == null) {
            station.company = null;
        } else {
            station.company = {} as CompanyResponse;
            station.company.companyID = rows[i][8] as number;
            station.company.companyName = rows[i][9] as string;
        }

        returningArray.push(station);
    }
    return returningArray;
}


export default {
    parseNumberParameter,
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
    parseValidationCodeConfirmationRequest,
    parseResetPasswordRequest,
    parseUserID,
    parseEmail,
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
    parseAddChargingConnectorRequest,
    parseDeleteChargingConnectorRequest,
    parseEditChargingConnectorRequest,
    parseSessionID,
    // -----------------------
    parseBuildingResponse,
    parseCompanyResponse,
    parseChargingTypeResponse,
    parseChargingStationResponse,
    // ----------------------- OCPP
    parseConnectorIDs,
    parseReservationInfo,
};