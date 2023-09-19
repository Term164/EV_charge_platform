import { UserRegistrationRequest } from "../models/requestModels";
import register from "../services/register";
import helper, { request } from "./helper";

describe('register a new user', () => {
    test('register a new unique user', async () => {
        const req_body: UserRegistrationRequest = {
            username: "Jani",
            email_account: "jani.bangiev@gmail.com",
            password: "idkSometing"
        };

        await request.post('/api/v1/auth/register/step1')
            .send(req_body)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const result = await register.checkUsernameUnique(req_body.username);

        expect(await helper.checkUserExists(req_body.username)).toEqual(true);
        expect(result).toEqual(false);

        //Step one has been completed succesfully so now we do the second step verification.
        await request.get(await helper.getValidationURL(req_body.username))
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(await helper.getAccountValidatedParameter(req_body.username)).toEqual(true);
    });

    test('fail to register a user with a taken username', async () => {

        await helper.insertNewUserReturningNumberOfUsers("Term", "somepass", "idk.reall@domain.com");

        const req_body: UserRegistrationRequest = {
            username: "Term",
            email_account: "some.email@domain.com",
            password: "idkSometing"
        };

        await request.post('/api/v1/auth/register/step1').send(req_body);

        const response = await request.post('/api/v1/auth/register/step1')
            .send(req_body)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({'Error': 'Username is already taken.'});
    });

    test('fail to register a user with a taken email', async () => {
        await helper.insertNewUserReturningNumberOfUsers(Math.random().toString(36).slice(7), "somepass", "termicrafter164@gmail.com");

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
    });

    test('username not included in sent data', async () => {
        const req_body = {
            email_account: "termicrafter164@gmail.com",
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/register/step1')
            .send(req_body)
            .expect(500)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({"Failed": "An error occured."});
    });

    test('email not included in sent data', async () => {

        const req_body = {
            username: "something",
            password: "idkSometing"
        };

        const response = await request.post('/api/v1/auth/register/step1')
            .send(req_body)
            .expect(500)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({"Failed": "An error occured."});
    });

    test('registration step 2 request to non existent URL not found', async () => {
        const response = await request.get('/api/v1/auth/register/step2/1/1123')
            .expect(404)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({'Error': 'This address does not exist'});
    });

});