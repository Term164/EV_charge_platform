import parser from "../models/modelParser";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { APIResponse } from "../models/requestModels";
import { UserAccount } from "../models/databaseModels";
import { SQLStatementManager } from "../utils/SQLStatementManager";

// =========================================== HELPER FUNCTIONS ======================================

async function saveSessionsID(accountID: number, sessionID: string) {
    return (await SQLStatementManager.saveSessionIDStatement.execute({params: [accountID, sessionID]}));
}

async function getUserDataFromEmail(email: string): Promise<UserAccount> {

    const response = await SQLStatementManager.getUserDataFromEmailStatement.execute({params: [email]});

    if (response.rows === undefined) throw new Error('response is undefined.');
    if (response.rows.length === 0) throw new Error('User does not exist.');

    return parser.parseUserAccountData(response.rows.at(0));
}

async function getUserDataFromUsername(username: string): Promise<UserAccount> {

    const response = await SQLStatementManager.getUserDataFromUsernameStatement.execute({params: [username]});

    if (response.rows === undefined) throw new Error('response is undefined.');
    if (response.rows.length === 0) throw new Error('User does not exist.');

    return parser.parseUserAccountData(response.rows.at(0));
}

// =========================================== MAIN FUNCTION =======================================
async function login (body: unknown): Promise<APIResponse> {

    let userLoginInfo;

    try {
        userLoginInfo = parser.parseUserLoginRequest(body);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Incorrect data: some fields are missing') return {status: 400, message: error.message, error: error.message ,data: null};
            else throw new Error("An error occured while processing user login request data.");
        }
        throw new Error('Secret error 42.');
    }

    let userData: UserAccount;

    try {
        if (userLoginInfo.email != null) userData = await getUserDataFromEmail(userLoginInfo.email);
        else if (userLoginInfo.username != null) userData = await getUserDataFromUsername(userLoginInfo.username);
        else throw new Error("Both username and password are null, which should not be possible");
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'User does not exist.') return {status: 400, message: 'The username/email or password is incorrect', error: error.message, data: null};
            else throw error;
        }

        throw new Error('Secret error 42.');
    }

    if (!(await bcrypt.compare(userLoginInfo.password, userData.password_hash))) {
        return {status: 400, message: 'The username/email or password is incorrect', error: null, data: null};
    }

    const sessionID = crypto.randomBytes(16).toString('hex');

    const result = await saveSessionsID(userData.id, sessionID);
    if (result.rowsAffected != 1) {
        throw new Error(`An error occured while trying to create a new session.`);
    }

    return {
        status: 200,
        message: "Login Successful",
        error: null,
        data: {'sessionID': sessionID}
    };

}

async function forgotPassword (body: unknown): Promise<APIResponse> {
    let email;

    try {
        email = parser.parseEmail(body);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Incorrect data: some fields are missing') return {status: 400, message: error.message, error: error.message ,data: null};
            else throw new Error("An error occured while processing user login request data.");
        }
        throw new Error('Secret error 42.');
    }

    const response = await SQLStatementManager.checkEmailExists.execute({params: [email]});

    if (!response.rows?.at(0)) return {status: 400, message: 'This email address is not asociated with any account.', error: null, data: null};
    //TODO: send validation code to email address

    const account_id = response.rows?.at(0)[0] as number;
    const validationCode = Math.floor(100000 + Math.random() * 900000);
    const result = await SQLStatementManager.createNewValidationCode.execute({params: [account_id, validationCode]});
    if (result.rowsAffected != 1) {
        return {status: 500, message: 'Something went wrong and we could not generate a validation code at this time.', error: 'Could not add new validation code to database', data: null};
    }

    return {status: 200, message: 'A new validation code has been sent to your email. It will expire in 10 minutes.', error: null, data: {account_id: account_id}};

}

async function confirmVerificationCode(body: unknown): Promise<APIResponse> {
    let validationRequest;

    try {
        validationRequest = parser.parseValidationCodeConfirmationRequest(body);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Incorrect data: some fields are missing') return {status: 400, message: error.message, error: error.message ,data: null};
            else throw new Error("An error occured while processing user login request data.");
        }
        throw new Error('Secret error 42.');
    }

    const response = await SQLStatementManager.confirmValidationCode.execute({params: [validationRequest.accountID]});
    if (!response.rows?.at(0)) return {status: 400, message: 'No password reset requests for this account.', error: null, data: null};

    const db_validationCode = response.rows.at(0)[0] as number;

    if (db_validationCode == validationRequest.validationCode)
        return {status: 200, message: 'Validation codes match.', error: null, data: null};

    return {status: 400, message: 'An error occured and we could not validate that the verification code matched.', error: null, data: null};
}

async function resetPassword(body: unknown): Promise<APIResponse> {
    let newPasswordRequest;

    try {
        newPasswordRequest = parser.parseResetPasswordRequest(body);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Incorrect data: some fields are missing') return {status: 400, message: error.message, error: error.message ,data: null};
            else throw new Error("An error occured while processing user login request data.");
        }
        throw new Error('Secret error 42.');
    }

    const passwordHash = await bcrypt.hash(newPasswordRequest.newPassword, 10);

    const result = await SQLStatementManager.updatePassword.execute({params: [passwordHash, newPasswordRequest.accountID]});
    if (result.rowsAffected != 1) {
        return {status: 500, message: 'Something went wrong and we could not update your password', error: 'Could not add new validation code to database', data: null};
    }

    return {status: 200, message: 'Password successfully updated!', error: null, data: null};
}

export default {
    login,
    forgotPassword,
    confirmVerificationCode,
    resetPassword
};