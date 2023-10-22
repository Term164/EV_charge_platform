interface APIResponse {
    status: number,
    data: object
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

interface CreateStationRequest {
    buildingID: number;
    chargingTypeID: number;
    stationName: string;
}

interface DeleteStationRequest {
    stationID: number;
}

interface AssignStationToCompanyRequest {
    stationID: number;
    companyID: number | null;
}

// Does not include companyID, since that is meant to be changed via the other
// API call -> station/assignCompany
interface EditStationRequest {
    stationID: number;
    newTypeID: number | null;
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
    CreateBuildingRequest,
    EditBuildingRequest,
    DeleteBuildingRequest,
    AssignCompanyRequest,
    GetAllStationsRequest,
    CreateStationRequest,
    DeleteStationRequest,
    AssignStationToCompanyRequest,
    EditStationRequest,
    CreateChargingTypeRequest,
    DeleteChargingTypeRequest,
    EditChargingTypeRequest,
    GetAllAvailableStationsRequest
};