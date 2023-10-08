import bcrypt from 'bcrypt';
import parser from '../models/modelParser';
import crypto from 'crypto';
import log from '../utils/logger';
import db from '../utils/database';
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
        return { status: 400, message: 'Username is already taken.', error: null , data: null};
    } else if (!(await checkEmailUnique(userData.email_account))) {
        return { status: 400, message: 'Email is already in use.', error: null , data: null};
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    // START TRANSACTION HERE
    await db.connection.startTransaction();
    const result = await SQLStatementManager.insertNewAccountStatement.execute({params: [userData.username, passwordHash, userData.email_account]});

    if (result.rowsAffected != 1) {
        await db.connection.rollback(); // If there is an error we rollback the current transaction
        throw new Error(`An error occured while trying to create a new user in the database.`);
    }

    const check = await generateVerificationTokenAndSave(result.rows?.at(0)[0] as number);

    if (check.rowsAffected != 1) {
        await db.connection.rollback(); // If there is an error we rollback the current transaction
        throw new Error(`Could not generate a user verification token`);
    }

    //TODO Send email to user, this is to be implemented once we figure out what kind of platform will host our application.
    await db.connection.commit(); // END TRANSACTION
    log.info(`User '${userData.username}' has successfully created a new account.`);
    return {status: 200, message: "Registration succesfull", error: null, data: null};
}

async function secondStep(params: unknown): Promise<APIResponse> {

    const info = parser.parseUserVerificationRequest(params);

    const result = await getUserVerificationToken(info);

    if (result.rows?.length === 0) {
        return {status: 404, message: 'This address does not exist' , error: null, data: null};
    }

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 2); // ! This is needed for the current DB as it is set 2 hours behind our time.

    const tokenTimeLimit = new Date(result.rows?.at(0)[1] as string);

    if (currentDate > tokenTimeLimit) {
        return {status: 400, message: "Validation token has expired", error: null, data: null};
    }

    if (result.rows?.at(0)[0] !== info.token) {
        return {status: 400, message: "User could not be validated", error: null, data: null};
    }

    // START TRANSACTION HERE
    await db.connection.startTransaction();

    const validationResult = await validateUserAccount(info.id);
    if (validationResult.rowsAffected !== 1) {
        await db.connection.rollback(); // If there is an error we rollback the current transaction
        throw new Error(`User could not be validated`);
    }

    const removalResult = await removeUserValidationToken(info.id);
    if (removalResult.rowsAffected !== 1) {
        await db.connection.rollback(); // If there is an error we rollback the current transaction
        log.error(`Could not remove validation token of user with id ${info.id}`);
    }

    await db.connection.commit(); // END TRANSACTION
    log.info(`User with id '${info.id}' is now succesfully registered.`);
    return {status: 200, message: "User successfuly verified" , error: null, data: null};
}

export default { firstStep, secondStep, checkEmailUnique, checkUsernameUnique };