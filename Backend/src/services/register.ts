import db from '.././utils/database';
import { DataTypeOIDs } from 'postgresql-client';
import bcrypt from 'bcrypt';
import parser from '../models/modelParser';
import crypto from 'crypto';
import log from '../utils/logger';
import { UserVerificationRequest } from '../models/requestModels';

// ================================ HELPER FUNCTIONS ===============================

async function checkUsernameUnique(username: string): Promise<boolean> {
    const statment = await db.connection.prepare(
        `SELECT id FROM Accounts
        WHERE username LIKE $1;`,
        {paramTypes: [DataTypeOIDs.varchar]}
    );

    const result = await statment.execute({params: [username]});
    return result.rows?.length == 0;
}

async function checkEmailUnique(email: string): Promise<boolean> {
    const statment = await db.connection.prepare(
        `SELECT id FROM Accounts
        WHERE email_account LIKE $1;`,
        {paramTypes: [DataTypeOIDs.varchar]}
    );

    const result = await statment.execute({params: [email]});
    return result.rows?.length == 0;
}

async function generateVerificationTokenAndSave(userId: number) {
    const token = crypto.randomBytes(32).toString('hex');

    const statement = await db.connection.prepare(
        `INSERT INTO Registration_secrets ("account_id", "registration_secret", "expiration_time")
        VALUES ($1, $2, NOW()+ interval '30 minutes');`,
        {paramTypes: [DataTypeOIDs.int4, DataTypeOIDs.varchar]}
    );

    return await statement.execute({params: [userId, token]});
}

async function getUserVerificationToken(params: UserVerificationRequest) {
    const statement = await db.connection.prepare(
        `SELECT registration_secret, expiration_time FROM Registration_secrets
        WHERE account_id = $1`,
        {paramTypes: [DataTypeOIDs.int4]}
    );

    return await statement.execute({params: [params.id]});
}

async function validateUserAccount(userID: number) {
    const statement = await db.connection.prepare(
        `UPDATE Accounts
        SET validated = TRUE
        WHERE id = $1;`,
        {paramTypes: [DataTypeOIDs.int4]}
    );

    return await statement.execute({params: [userID]});
}

async function removeUserValidationToken(accountID: number) {
    const statment = await db.connection.prepare(
        `DELETE FROM Registration_secrets
        WHERE account_id = $1`,
        {paramTypes: [DataTypeOIDs.int4]}
    );

    return await statment.execute({params: [accountID]});
}

async function firstStep(body: unknown): Promise<object> {

    const userData = parser.parseUserRegistrationRequest(body);

    if (!(await checkUsernameUnique(userData.username))) {
        return {'Failed': 'Username is already taken.'};
    } else if (!(await checkEmailUnique(userData.email_account))) {
        return {'Failed': 'Email is already in use.'};
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const statement = await db.connection.prepare(
        `INSERT INTO Accounts ("username","password_hash", "email_account")
        VALUES ($1, $2, $3) RETURNING id;`,
        {paramTypes: [DataTypeOIDs.varchar,DataTypeOIDs.varchar,DataTypeOIDs.varchar]}
    );

    const result = await statement.execute({params: [userData.username, passwordHash, userData.email_account]});

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
    return {"Success": "Registration succesfull"};
}

async function secondStep(params: unknown): Promise<object> {

    const info = parser.parseUserVerificationRequest(params);

    const result = await getUserVerificationToken(info);

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 2); // ! This is needed for the current DB as it is set 2 hours behind our time.

    const tokenTimeLimit = new Date(result.rows?.at(0)[1] as string);

    if (currentDate > tokenTimeLimit) {
        return {"Failed": "Validation token has expired"};
    }

    if (result.rows?.at(0)[0] !== info.token) {
        return {"Failed": "User could not be validated"};
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
    return {"Success": "User successfuly verified"};
}

export default { firstStep, secondStep, checkEmailUnique, checkUsernameUnique };