import { UserRegistrationRequest } from "../models/requestModels";
import { request } from "./helper";

const randomUsername = Math.random().toString(36).slice(7);
const randomEmail = Math.random().toString(36).slice(7);

describe('user login', () => {
    beforeAll(async () => {
        const req_body: UserRegistrationRequest = {
            username: randomUsername,
            email_account: randomEmail,
            password: "idkSometing"
        };

        await request.post('/api/v1/auth/register/step1').send(req_body);
    });

    test('login user with username', async () => {

        const loginRequest = {
            username: randomUsername,
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('sessionID');
        expect(response.body.sessionID).toHaveLength(32);
    });

    test('login user with email',async () => {

        const loginRequest = {
            email: randomEmail,
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(200)
            .expect('Content-Type', /application\/json/);


        expect(response.body).toHaveProperty('sessionID');
        expect(response.body.sessionID).toHaveLength(32);
    });

    test('fail login user with username and wrong password', async () => {

        const loginRequest = {
            username: randomUsername,
            password: "idkSometinlkhkjg"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('Error');
        expect(response.body.Error).toEqual('The username/email or password is incorrect');
    });

    test('fail login user with email and wrong password', async () => {

        const loginRequest = {
            email: randomEmail,
            password: "idkSometinlkhkjg"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('Error');
        expect(response.body.Error).toEqual('The username/email or password is incorrect');
    });

    test('fail login user with username that does not exist', async () => {

        const loginRequest = {
            username: "Jani",
            password: "idkSometinlkhkjg"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('Error');
        expect(response.body.Error).toEqual('The username/email or password is incorrect');
    });

    test('fail login when password not supplied.', async () => {

        const loginRequest = {
            username: "Jani",
            email: "idkSometinlkhkjg"
        };

        const response = await request.post('/api/v1/auth/login')
            .send(loginRequest)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('Error');
        expect(response.body.Error).toEqual('Incorrect data: some fields are missing');
    });
});