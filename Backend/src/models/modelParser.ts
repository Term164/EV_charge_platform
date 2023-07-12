import { UserRegistrationRequest, UserVerificationRequest } from "./requestModels";

function isString(text: unknown): text is string {
    return typeof text === 'string' || text instanceof String;
}

function isInt(number: unknown): number is number {
    return typeof number === 'number' || number instanceof Number;
}

function parseIntegerParameter(param: unknown, paramName: string): number {
    if (!param || !isInt(param)) {
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

export default {
    parseUserRegistrationRequest,
    parseUserVerificationRequest
};