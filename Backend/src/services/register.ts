import bcrypt from 'bcrypt';
import parser from '../models/modelParser';
import crypto from 'crypto';
import log from '../utils/logger';
import { APIResponse, UserVerificationRequest } from '../models/requestModels';
import { SQLStatementManager } from '../utils/SQLStatementManager';

// ================================ HELPER FUNCTIONS ===============================

async function checkUsernameUnique(username: string): Promise<boolean> {
    const result = await SQLStatementManager.checkUniqueUsernameStatement.execute({params: [username]});
    return result.rows?.length == 0;
}

async function checkEmailUnique(email: string): Promise<boolean> {
    const result = await SQLStatementManager.checkUniqueEmailStatement.execute({params: [email]});
    return result.rows?.length == 0;
}

async function generateVerificationTokenAndSave(userId: number) {
    const token = crypto.randomBytes(32).toString('hex');

    return await SQLStatementManager.saveVerificationTokenStatement.execute({params: [userId, token]});
}

async function getUserVerificationToken(params: UserVerificationRequest) {
    return await SQLStatementManager.getVerificationTokenStatement.execute({params: [params.id]});
}

async function validateUserAccount(userID: number) {
    return await SQLStatementManager.validateUserAccountStatement.execute({params: [userID]});
}

async function removeUserValidationToken(accountID: number) {
    return await SQLStatementManager.removeValidationTokenStatement.execute({params: [accountID]});
}

// =========================================== MAIN FUNCTIONS =======================================

async function firstStep(body: unknown): Promise<APIResponse> {

    const userData = parser.parseUserRegistrationRequest(body);

    if (!(await checkUsernameUnique(userData.username))) {
        return { status: 400, data: {'Error': 'Username is already taken.'}};
    } else if (!(await checkEmailUnique(userData.email_account))) {
        return { status: 400, data: {'Error': 'Email is already in use.'}};
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const result = await SQLStatementManager.insertNewAccountStatement.execute({params: [userData.username, passwordHash, userData.email_account]});

    if (result.rowsAffected != 1) {
        throw new Error(`An error occured while trying to create a new user in the database.`);
    }

    const check = await generateVerificationTokenAndSave(result.rows?.at(0)[0] as number);

    if (check.rowsAffected != 1) {
        throw new Error(`Could not generate a user verification token`);
    }

    //TODO: cleanup if any error is thrown the user should be removed from the DB.
    //TODO Send email to user, this is to be implemented once we figure out what kind of platform will host our application.
    log.info(`User '${userData.username}' has successfully created a new account.`);
    return {status: 200, data: {"Success": "Registration succesfull"}};
}

async function secondStep(params: unknown): Promise<APIResponse> {

    const info = parser.parseUserVerificationRequest(params);

    const result = await getUserVerificationToken(info);

    if (result.rows?.length === 0) {
        return {status: 404, data: {'Error': 'This address does not exist'}};
    }

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 2); // ! This is needed for the current DB as it is set 2 hours behind our time.

    const tokenTimeLimit = new Date(result.rows?.at(0)[1] as string);

    if (currentDate > tokenTimeLimit) {
        return {status: 400, data: {"Error": "Validation token has expired"}};
    }

    if (result.rows?.at(0)[0] !== info.token) {
        return {status: 400, data: {"Error": "User could not be validated"}};
    }

    const validationResult = await validateUserAccount(info.id);
    if (validationResult.rowsAffected !== 1) {
        throw new Error(`User could not be validated`);
    }

    const removalResult = await removeUserValidationToken(info.id);
    if (removalResult.rowsAffected !== 1) {
        log.error(`Could not remove validation token of user with id ${info.id}`);
    }

    log.info(`User with id '${info.id}' is now succesfully registered.`);
    return {status: 200, data: {"Success": "User successfuly verified"}};
}

export default { firstStep, secondStep, checkEmailUnique, checkUsernameUnique };