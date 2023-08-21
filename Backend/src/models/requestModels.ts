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

interface AssignEmployeeToBuildingRequest {
    userID: number;
    buildingID: number;
    companyAdminID: number;
    expirationDate?: Date;
}

export {
    UserRegistrationRequest,
    UserVerificationRequest,
    UserLoginRequest,
    AssignRequest,
    AssignEmployeeToBuildingRequest,
    APIResponse
};