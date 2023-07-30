import { UserRegistrationRequest } from "../models/requestModels";
import database from "../utils/database";
import helper, { request } from "./helper";

describe('user login', () => {
    beforeAll(async () => {
        await database.establishDBConnection();
        const req_body: UserRegistrationRequest = {
            username: "Term",
            email_account: "termicrafter164@gmail.com",
            password: "idkSometing"
        };

        await request.post('/api/v1/auth/register/step1').send(req_body);
    });

    test('login user with username', async () => {
        const numberOfSessionsBefore = await helper.getNumberOfSessions();

        const loginRequest = {
            username: "Term",
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfSessionsAfter = await helper.getNumberOfSessions();

        expect(response.body).toHaveProperty('sessionID');
        expect(response.body.sessionID).toHaveLength(32);
        expect(numberOfSessionsAfter).toEqual(numberOfSessionsBefore + 1);
    });

    test('login user with email',async () => {
        const numberOfSessionsBefore = await helper.getNumberOfSessions();

        const loginRequest = {
            email: "termicrafter164@gmail.com",
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfSessionsAfter = await helper.getNumberOfSessions();

        expect(response.body).toHaveProperty('sessionID');
        expect(response.body.sessionID).toHaveLength(32);
        expect(numberOfSessionsAfter).toEqual(numberOfSessionsBefore + 1);
    });

    test('fail login user with username and wrong password', async () => {
        const numberOfSessionsBefore = await helper.getNumberOfSessions();

        const loginRequest = {
            username: "Term",
            password: "idkSometinlkhkjg"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfSessionsAfter = await helper.getNumberOfSessions();

        expect(response.body).toHaveProperty('Error');
        expect(response.body.Error).toEqual('The username/email or password is incorrect');
        expect(numberOfSessionsAfter).toEqual(numberOfSessionsBefore);
    });

    test('fail login user with email and wrong password', async () => {
        const numberOfSessionsBefore = await helper.getNumberOfSessions();

        const loginRequest = {
            email: "termicrafter164@gmail.com",
            password: "idkSometinlkhkjg"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfSessionsAfter = await helper.getNumberOfSessions();

        expect(response.body).toHaveProperty('Error');
        expect(response.body.Error).toEqual('The username/email or password is incorrect');
        expect(numberOfSessionsAfter).toEqual(numberOfSessionsBefore);
    });

    test('fail login user with username that does not exist', async () => {
        const numberOfSessionsBefore = await helper.getNumberOfSessions();

        const loginRequest = {
            username: "Jani",
            password: "idkSometinlkhkjg"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfSessionsAfter = await helper.getNumberOfSessions();

        expect(response.body).toHaveProperty('Error');
        expect(response.body.Error).toEqual('The username/email or password is incorrect');
        expect(numberOfSessionsAfter).toEqual(numberOfSessionsBefore);
    });

    test('fail login when password not supplied.', async () => {
        const numberOfSessionsBefore = await helper.getNumberOfSessions();

        const loginRequest = {
            username: "Jani",
            email: "idkSometinlkhkjg"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfSessionsAfter = await helper.getNumberOfSessions();

        expect(response.body).toHaveProperty('Error');
        expect(response.body.Error).toEqual('Incorrect data: some fields are missing');
        expect(numberOfSessionsAfter).toEqual(numberOfSessionsBefore);
    });


    afterAll(async () => {
        // !IMPORTANT NOTE: The sequence wich the tables are cleared is important as there are foreign keys.
        await helper.clearSessionsTable();
        await helper.clearRegistrationSecretsTable();
        await helper.clearAccountsTable();
        await database.closeDBConnection();
    });
});