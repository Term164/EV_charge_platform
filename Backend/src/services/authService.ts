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

export default {
    login
};