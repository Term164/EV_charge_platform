interface APIResponse {
    status: number,
    message: string,
    error: string | null,
    data: object | null
}

interface UserRegistrationRequest {
    username: string;
    email_account: string;
    password: string;
}

interface UserVerificationRequest {
    id: number;
    token: string;
}

interface UserLoginRequest {
    username?: string;
    email?: string;
    password: string;
}

interface AssignRequest {
    userID: number;
    otherID: number;
}

interface CreateCompanyRequest {
    companyName: string;
}

interface DeleteCompanyRequest {
    companyID: number;
}

interface EditCompanyRequest {
    companyID: number;
    newCompanyName: string;
}

interface AssignEmployeeToBuildingRequest {
    userID: number;
    buildingID: number;
    companyAdminID: number;
    expirationDate?: Date;
}

interface RevokeBuildingAccessRequest {
    userID: number,
    buildingID: number
}

interface EditUserProfileRequest {
    id: number,
    username?: string,
    email_account?: string,
    profile_picture?: string,
    rfid?: number,
    company_id?: number
}

interface CreateBuildingRequest {
    buildingName: string;
    buildingLocation: string;
}

interface EditBuildingRequest {
    buildingID: number;
    newBuildingName: string | null;
    newBuildingLocation: string | null;
}

interface DeleteBuildingRequest {
    buildingID: number;
}

interface AssignCompanyRequest {
    companyID: number;
    buildingID: number;
}

interface GetAllStationsRequest {
    buildingID: number | null;
}

interface connectorTypeIDAndSerialNumber {
    chargingTypeID: number;
    serialNumber: number;
}

interface CreateStationRequest {
    buildingID: number;
    stationName: string;
    chargingConnectors: connectorTypeIDAndSerialNumber[];
}

interface DeleteStationRequest {
    stationID: number;
}

interface AssignStationToCompanyRequest {
    stationID: number;
    companyID: number | null;
}

// Does not include companyID, different request
// Does not include connectors, different request
interface EditStationRequest {
    stationID: number;
    newBuildingID: number | null;
    newStationName: string | null;
}

interface CreateChargingTypeRequest {
    chargingType: string;
}

interface DeleteChargingTypeRequest {
    chargingTypeID: number;
}

interface EditChargingTypeRequest {
    chargingTypeID: number;
    newChargingType: string;
}

interface GetAllAvailableStationsRequest {
    userID: number;
}

interface AddChargingConnectorRequest {
    stationID: number;
    chargingConnector: connectorTypeIDAndSerialNumber;
}

interface ChargingConnectorID {
    chargingConnectorID: number;
}

interface EditChargingConnectorRequest {
    chargingConnectorID: number;
    chargingTypeID: number | null;
    serialNumber: number | null;
}

export {
    UserRegistrationRequest,
    UserVerificationRequest,
    UserLoginRequest,
    AssignRequest,
    AssignEmployeeToBuildingRequest,
    APIResponse,
    CreateCompanyRequest,
    DeleteCompanyRequest,
    EditCompanyRequest,
    RevokeBuildingAccessRequest,
    EditUserProfileRequest,
    CreateBuildingRequest,
    EditBuildingRequest,
    DeleteBuildingRequest,
    AssignCompanyRequest,
    GetAllStationsRequest,
    CreateStationRequest,
    connectorTypeIDAndSerialNumber,
    DeleteStationRequest,
    AssignStationToCompanyRequest,
    EditStationRequest,
    CreateChargingTypeRequest,
    DeleteChargingTypeRequest,
    EditChargingTypeRequest,
    GetAllAvailableStationsRequest,
    AddChargingConnectorRequest,
    ChargingConnectorID,
    EditChargingConnectorRequest
};