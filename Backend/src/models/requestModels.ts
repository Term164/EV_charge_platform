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

interface AssignAdminRequest {
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

export {
    UserRegistrationRequest,
    UserVerificationRequest,
    UserLoginRequest,
    AssignAdminRequest,
    APIResponse,
    CreateCompanyRequest,
    DeleteCompanyRequest,
    EditCompanyRequest
};