import db from '.././utils/database';
import { DataTypeOIDs } from 'postgresql-client';
import log from '../utils/logger';
import bcrypt from 'bcrypt';
import { UserRegistrationRequest } from '../models/requestModels';


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
        VALUES ($1, $2, $3);`
    );

    //const result =
    await statement.execute({params: [userData.username, passwordHash, userData.email_account]});
    //log.info(result);

    return {"Success": "Registration succesfull"};
}

export default { firstStep, checkEmailUnique, checkUsernameUnique };