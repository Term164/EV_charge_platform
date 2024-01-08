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
    rfid?: string,
    company_id?: number
}

interface CreateBuildingRequest {
    buildingName: string;
    buildingLocation: string;
    buildingLongitude: number;
    buildingLatitude: number;
}

interface EditBuildingRequest {
    buildingID: number;
    newBuildingName: string | null;
    newBuildingLocation: string | null;
    newBuildingLongitude: number | null;
    newBuildingLatitude: number | null;
}

interface AssignCompanyRequest {
    companyID: number;
    buildingID: number;
}

interface GetAllStationsRequest {
    buildingID: number | null;
}

interface connectorTypeIDAndSerialNumberAndPowerOutput {
    chargingTypeID: number;
    serialNumber: number;
    powerOutput: number;
}

interface CreateStationRequest {
    buildingID: number;
    stationName: string;
    chargingConnectors: connectorTypeIDAndSerialNumberAndPowerOutput[];
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

interface EditChargingTypeRequest {
    chargingTypeID: number;
    newChargingType: string;
}

interface AddChargingConnectorRequest {
    stationID: number;
    chargingConnector: connectorTypeIDAndSerialNumberAndPowerOutput;
}

interface EditChargingConnectorRequest {
    chargingConnectorID: number;
    chargingTypeID: number | null;
    serialNumber: number | null;
    powerOutput: number | null;
}

interface CreateReservationRequest {
    userID: number;
    desiredBuildingID: number;
    chargingTime: number;
    desiredChargingTypeID: number | null;
    desiredFrom: Date;
    desiredTo: Date;
}

interface EditReservationRequest {
    reservationID: number;
    desiredFrom: Date | null;
    desiredTo: Date | null;
    chargingTime: number | null;
    desiredChargingTypeID: number | null;
}

interface GetPercentageRequest {
    userID: number;
    buildingID: number;
    date: Date;
}

export {
    UserRegistrationRequest,
    UserVerificationRequest,
    UserLoginRequest,
    AssignRequest,
    AssignEmployeeToBuildingRequest,
    APIResponse,
    EditCompanyRequest,
    RevokeBuildingAccessRequest,
    EditUserProfileRequest,
    CreateBuildingRequest,
    EditBuildingRequest,
    AssignCompanyRequest,
    GetAllStationsRequest,
    CreateStationRequest,
    connectorTypeIDAndSerialNumberAndPowerOutput,
    AssignStationToCompanyRequest,
    EditStationRequest,
    EditChargingTypeRequest,
    AddChargingConnectorRequest,
    EditChargingConnectorRequest,
    CreateReservationRequest,
    EditReservationRequest,
    GetPercentageRequest
};