interface UserRegistrationRequest {
    username: string;
    email_account: string;
    password: string;
}

interface userVerificationParams {
    id: string;
    token: string;
}

export {
    UserRegistrationRequest,
    userVerificationParams
};