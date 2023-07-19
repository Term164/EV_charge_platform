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

export {
    UserRegistrationRequest,
    UserVerificationRequest,
    UserLoginRequest,
    APIResponse
};