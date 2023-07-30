import parser from "../models/modelParser";
import bcrypt from 'bcrypt';
import db from '.././utils/database';
import crypto from 'crypto';
import { DataTypeOIDs} from "postgresql-client";
import { APIResponse } from "../models/requestModels";
import { UserAccount } from "../models/databaseModels";

// =========================================== HELPER FUNCTIONS ======================================

async function saveSessionsID(accountID: number, sessionID: string) {
    const statement = await db.connection.prepare(
        `INSERT INTO Sessions ("account_id", "session_secret", "expiration_time")
        VALUES ($1, $2, NOW() + interval '30 minutes');`,
        {paramTypes: [DataTypeOIDs.numeric, DataTypeOIDs.varchar]}
    );

    return (await statement.execute({params: [accountID, sessionID]}));
}

async function getUserDataFromEmail(email: string): Promise<UserAccount> {
    const statement = await db.connection.prepare(
        `SELECT *
        FROM Accounts
        WHERE email_account = $1`,
        {paramTypes: [DataTypeOIDs.varchar]}
    );

    const response = await statement.execute({params: [email]});

    if (response.rows === undefined) throw new Error('response is undefined.');
    if (response.rows.length === 0) throw new Error('User does not exist.');

    return parser.parseUserAccountData(response.rows.at(0));
}

async function getUserDataFromUsername(username: string): Promise<UserAccount> {
    const statement = await db.connection.prepare(
        `SELECT *
        FROM Accounts
        WHERE username = $1`,
        {paramTypes: [DataTypeOIDs.varchar]}
    );

    const response = await statement.execute({params: [username]});

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
            if (error.message === 'Incorrect data: some fields are missing') return {status: 400, data: {'Error': error.message}};
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
            if (error.message === 'User does not exist.') return {status: 400, data: {'Error': 'The username/email or password is incorrect'}};
            else throw error;
        }

        throw new Error('Secret error 42.');
    }


    if (!(await bcrypt.compare(userLoginInfo.password, userData.password_hash))) {
        return {status: 400, data: {'Error': 'The username/email or password is incorrect'}};
    }

    const sessionID = crypto.randomBytes(16).toString('hex');

    const result = await saveSessionsID(userData.id, sessionID);
    if (result.rowsAffected != 1) {
        throw new Error(`An error occured while trying to create a new session.`);
    }

    return {
        status: 200,
        data: {'sessionID': sessionID}
    };

}

export default {
    login
};