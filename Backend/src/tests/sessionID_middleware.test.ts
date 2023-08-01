import { UserRegistrationRequest } from "../models/requestModels";
import database from "../utils/database";
import helper, { request } from "./helper";


let currentSessionID: string;

describe('sessionID middleware checker', () => {
    beforeAll(async () => {
        await database.establishDBConnection();
        const req_body: UserRegistrationRequest = {
            username: "Term",
            email_account: "termicrafter164@gmail.com",
            password: "idkSometing"
        };

        const loginRequestData = {
            username: "Term",
            password: "idkSometing"
        };


        await request.post('/api/v1/auth/register/step1').send(req_body);
        await request.get(await helper.getValidationURL(req_body.username));
        const response = await request.post('/api/v1/auth/login').send(loginRequestData);
        if ('sessionID' in response.body) {
            currentSessionID = response.body.sessionID as string;
        } else {
            fail('Could not get sessionID from login request.');
        }
    });

    test('request granted with proper sessionID', async () => {
        const response = await request.get('/api/v1/dev/ping')
            .send({sessionID: currentSessionID})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toEqual('pong');
    });

    test('request denied with wrong sessionID', async () => {
        const response = await request.get('/api/v1/dev/ping')
            .send({sessionID: "wrong"})
            .expect(401)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toEqual("No session with this ID exists.");
    });

    // TODO: test that the session expiration time is extended.
    // TODO: test that the session is denide when the sessionID is expired.

    afterAll(async () => {
        // !IMPORTANT NOTE: The sequence wich the tables are cleared is important as there are foreign keys.
        await helper.clearSessionsTable();
        await helper.clearRegistrationSecretsTable();
        await helper.clearAccountsTable();
        await database.closeDBConnection();
    });
});