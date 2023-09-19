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
    AssignCompanyRequest
};