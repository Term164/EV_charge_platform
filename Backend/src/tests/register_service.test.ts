import { UserRegistrationRequest } from "../models/requestModels";
import register from "../services/register";
import helper, { request } from "./helper";
import database from "../utils/database";

describe('register a new user', () => {

    // After all tests clear the database, for the next round of unit tests.

    beforeAll(async () => {
        await database.establishDBConnection();
        const req_body: UserRegistrationRequest = {
            username: "Term",
            email_account: "termicrafter164@gmail.com",
            password: "idkSometing"
        };

        await request.post('/api/v1/auth/register/step1').send(req_body);
    });

    test('register a new unique user', async () => {

        const numberOfAccountsBefore = await helper.getNumberOfAccounts();
        const numberOfTokensBefore = await helper.getNumberOfTokens();

        const req_body: UserRegistrationRequest = {
            username: "Jani",
            email_account: "jani.bangiev@gmail.com",
            password: "idkSometing"
        };

        await request.post('/api/v1/auth/register/step1')
            .send(req_body)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfAccountsAfter = await helper.getNumberOfAccounts();
        const numberOfTokensAfter = await helper.getNumberOfTokens();
        const result = await register.checkUsernameUnique(req_body.username);

        expect(result).toEqual(false);
        expect(numberOfAccountsAfter).toEqual(numberOfAccountsBefore + 1);
        expect(numberOfTokensAfter).toEqual(numberOfTokensBefore + 1);

        //Step one has been completed succesfully so now we do the second step verification.
        await request.get(await helper.getValidationURL(req_body.username))
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfTokensAfterValidation = await helper.getNumberOfTokens();
        expect(numberOfTokensBefore).toEqual(numberOfTokensAfterValidation);

        expect(await helper.getAccountValidatedParameter(req_body.username)).toEqual(true);
    });

    test('fail to register a user with a taken username', async () => {

        const accountsBeforeRequest = await helper.getNumberOfAccounts();

        const req_body: UserRegistrationRequest = {
            username: "Term",
            email_account: "some.email@domain.com",
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/register/step1')
            .send(req_body)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({'Error': 'Username is already taken.'});
        const accountsAfterRequest = await helper.getNumberOfAccounts();

        expect(accountsBeforeRequest).toEqual(accountsAfterRequest);
    });

    test('fail to register a user with a taken email', async () => {

        const accountsBeforeRequest = await helper.getNumberOfAccounts();

        const req_body: UserRegistrationRequest = {
            username: "Term164",
            email_account: "termicrafter164@gmail.com",
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/register/step1')
            .send(req_body)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({'Error': 'Email is already in use.'});

        const accountsAfterRequest = await helper.getNumberOfAccounts();

        expect(accountsBeforeRequest).toEqual(accountsAfterRequest);
    });

    test('username not included in sent data', async () => {

        const accountsBeforeRequest = await helper.getNumberOfAccounts();

        const req_body = {
            email_account: "termicrafter164@gmail.com",
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/register/step1')
            .send(req_body)
            .expect(500)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({"Failed": "An error occured."});

        const accountsAfterRequest = await helper.getNumberOfAccounts();

        expect(accountsBeforeRequest).toEqual(accountsAfterRequest);
    });

    test('email not included in sent data', async () => {

        const accountsBeforeRequest = await helper.getNumberOfAccounts();

        const req_body = {
            username: "something",
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/register/step1')
            .send(req_body)
            .expect(500)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({"Failed": "An error occured."});
        const accountsAfterRequest = await helper.getNumberOfAccounts();

        expect(accountsBeforeRequest).toEqual(accountsAfterRequest);
    });

    test('registration step 2 request to non existent URL not found', async () => {
        const response = await request.get('/api/v1/auth/register/step2/1/1123')
            .expect(404)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({'Error': 'This address does not exist'});
    });


    afterAll(async () => {
        // !IMPORTANT NOTE: The sequence wich the tables are cleared is important as there are foreign keys.
        await helper.clearRegistrationSecretsTable();
        await helper.clearAccountsTable();
        await database.closeDBConnection();
    });

});