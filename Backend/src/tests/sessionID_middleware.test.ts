import { UserRegistrationRequest } from "../models/requestModels";
import helper, { request } from "./helper";

const randomUsername = Math.random().toString(36).slice(7);
let currentSessionID: string;
let userID: string;

describe('sessionID middleware checker', () => {
    beforeAll(async () => {
        const req_body: UserRegistrationRequest = {
            username: String(randomUsername),
            email_account: "random@gmail.com",
            password: "idkSometing"
        };

        const loginRequestData = {
            username: String(randomUsername),
            password: "idkSometing"
        };

        userID = await helper.insertNewUserReturningUserID("test","test","test");

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
            .send({sessionID: currentSessionID, sessionTest: true})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toEqual('pong');
    });

    test('request denied with wrong sessionID', async () => {
        const response = await request.get('/api/v1/dev/ping')
            .send({sessionID: "wrong", sessionTest: true})
            .expect(401)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toEqual("No session with this ID exists.");
    });


    test('session is extended upon succesfull request', async () => {
        await helper.insertDummySession(parseInt(userID),"test");
        const expirationBeforeRequest = new Date(await helper.getSessionExpirationDate("test"));

        const response = await request.get('/api/v1/dev/ping')
            .send({sessionID: "test", sessionTest: true})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const expirationAfterRequest = new Date(await helper.getSessionExpirationDate("test"));
        expect(expirationBeforeRequest < expirationAfterRequest).toEqual(true);
        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toEqual('pong');
    });

    test('request denied due to expired session', async () => {
        await helper.insertDummySession(parseInt(userID),"test2");
        await helper.makeSessionExpired("test2");

        const response = await request.get('/api/v1/dev/ping')
            .send({sessionID: "test2", sessionTest: true})
            .expect(401)
            .expect('Content-Type', /application\/json/);


        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toEqual('This sessionID has expired.');
    });
});