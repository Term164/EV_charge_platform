import { UserRegistrationRequest } from "../models/requestModels";
import register from "../services/register";
import helper, { request } from "./helper";
import database from "../utils/database";

describe('register a new user', () => {

    // After all tests clear the database, for the next round of unit tests.

    beforeAll(async () => {
        await database.establishDBConnection();
    });

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
        expect(result).toEqual(false);
    });

    afterAll(async () => {
        await helper.clearAccountsTable();
        await database.closeDBConnection();
    });

});