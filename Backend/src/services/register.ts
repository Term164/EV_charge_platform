import db from '.././utils/database';
import { DataTypeOIDs } from 'postgresql-client';
import log from '../utils/logger';
import bcrypt from 'bcrypt';
import { UserRegistrationRequest, userVerificationParams } from '../models/requestModels';
import crypto from 'crypto';

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

    //const result =
    await statement.execute({params: [userId, token]});
}

async function checkUserVerificationToken(params: userVerificationParams): Promise<boolean> {
    const statement = await db.connection.prepare(
        `SELECT registration_secret, expiration_time FROM Registration_secrets
        WHERE account_id = $1`,
        {paramTypes: [DataTypeOIDs.int4]}
    );

    const result = await statement.execute({params: [parseInt(params.id)]});

    // TODO: check that the request has been made in the specified time limit

    return result.rows?.at(0)[0] === params.token;

}

async function validateUserAccount(userID: number) {
    const statement = await db.connection.prepare(
        `UPDATE Accounts
        SET validated = TRUE
        WHERE id = $1;`,
        {paramTypes: [DataTypeOIDs.int4]}
    );

    await statement.execute({params: [userID]});
}

async function firstStep(body: unknown): Promise<object> {

    if(!body){
        log.warn('User registration failed as the body of the request is emtpy.');
        return {'Failed': 'Registration failed the body of the request was empty.'};
    }

    const userData = body as UserRegistrationRequest;

    log.info(userData);

    if (!(await checkUsernameUnique(userData.username))){
        return {'Failed': 'Username is already taken.'};
    }else if (!(await checkEmailUnique(userData.email_account))){
        return {'Failed': 'Email is already in use.'};
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const statement = await db.connection.prepare(
        `INSERT INTO Accounts ("username","password_hash", "email_account")
        VALUES ($1, $2, $3) RETURNING id;`,
        {paramTypes: [DataTypeOIDs.varchar,DataTypeOIDs.varchar,DataTypeOIDs.varchar]}
    );

    const result = await statement.execute({params: [userData.username, passwordHash, userData.email_account]}); // TODO check if succeful.
    await generateVerificationTokenAndSave(result.rows?.at(0) as number); // TODO check if succeful.
    //log.info(result);

    //TODO Send email to user, this is to be implemented once we figure out what kind of platform will host our application.

    return {"Success": "Registration succesfull"};
}

async function secondStep(params: unknown): Promise<object> {

    if(!params){
        log.warn('User verification failed as the parameters do not match the required types or are empty.');
        return {'Failed': 'Verification failed'};
    }

    const info = params as userVerificationParams;

    if(await checkUserVerificationToken(info)){
        void validateUserAccount(parseInt(info.id)); // TODO: Check if request completed successfuly.
        return {"Success": "User successfuly verified"};
    }
    return {"Failed": "User could not be validated"};
}

export default { firstStep, secondStep, checkEmailUnique, checkUsernameUnique };