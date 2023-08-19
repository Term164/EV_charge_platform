import { UserRegistrationRequest } from "../models/requestModels";
import database from "../utils/database";
import helper, { request } from "./helper";


let currentSessionID: string;
let currentUserID: string;

describe('assign admin service', () => {
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
        const validationURL = await helper.getValidationURL(req_body.username);
        await request.get(validationURL);
        currentUserID = validationURL.split('/').at(-2) as  string;
        const response = await request.post('/api/v1/auth/login').send(loginRequestData);
        if ('sessionID' in response.body) {
            currentSessionID = response.body.sessionID as string;
        } else {
            fail('Could not get sessionID from login request.');
        }
    }, 10000);

    test('assign new building admin', async () => {
        const numberOfBuildingAdminsBefore = await helper.getNumberOfBuildingAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            buildingID: '1'
        };

        await request.post('/api/v1/user/post/assignBadmin')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingAdminsAfter = await helper.getNumberOfBuildingAdmins();

        expect(numberOfBuildingAdminsAfter).toEqual(numberOfBuildingAdminsBefore+1);

    });

    test('assign new company admin', async () => {
        const numberOfCompanyAdminsBefore = await helper.getNumberOfCompanyAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            companyID: '1'
        };

        await request.post('/api/v1/user/post/assignCadmin')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfCompanyAdminsAfter = await helper.getNumberOfCompanyAdmins();

        expect(numberOfCompanyAdminsAfter).toEqual(numberOfCompanyAdminsBefore+1);
    });

    test('assign new building admin that has already been set', async () => {
        const numberOfBuildingAdminsBefore = await helper.getNumberOfBuildingAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            buildingID: '1'
        };

        await request.post('/api/v1/user/post/assignBadmin')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingAdminsAfter = await helper.getNumberOfBuildingAdmins();

        expect(numberOfBuildingAdminsAfter).toEqual(numberOfBuildingAdminsBefore);

    });

    test('assign new company admin that has already been set', async () => {
        const numberOfCompanyAdminsBefore = await helper.getNumberOfCompanyAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            companyID: '1'
        };

        await request.post('/api/v1/user/post/assignCadmin')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfCompanyAdminsAfter = await helper.getNumberOfCompanyAdmins();

        expect(numberOfCompanyAdminsAfter).toEqual(numberOfCompanyAdminsBefore);
    });

    test('assign user that does not exist to company admins', async () => {
        const numberOfCompanyAdminsBefore = await helper.getNumberOfCompanyAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: '12312312',
            companyID: '1'
        };

        const result = await request.post('/api/v1/user/post/assignCadmin')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfCompanyAdminsAfter = await helper.getNumberOfCompanyAdmins();
        expect(numberOfCompanyAdminsAfter).toEqual(numberOfCompanyAdminsBefore);
        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('userID');
    });

    test('assign user that does not exist to building admins', async () => {
        const numberOfBuildingAdminsBefore = await helper.getNumberOfBuildingAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: '12312312',
            buildingID: '1'
        };

        const result = await request.post('/api/v1/user/post/assignBadmin')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingAdminsAfter = await helper.getNumberOfBuildingAdmins();
        expect(numberOfBuildingAdminsAfter).toEqual(numberOfBuildingAdminsBefore);
        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('userID');
    });

    test('assign user to company admins for company that does not exist', async () => {
        const numberOfCompanyAdminsBefore = await helper.getNumberOfCompanyAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            companyID: '11231231'
        };

        const result = await request.post('/api/v1/user/post/assignCadmin')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfCompanyAdminsAfter = await helper.getNumberOfCompanyAdmins();
        expect(numberOfCompanyAdminsAfter).toEqual(numberOfCompanyAdminsBefore);
        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('companyID');
    });

    test('assign user to building admins for a building that does not exist', async () => {
        const numberOfBuildingAdminsBefore = await helper.getNumberOfBuildingAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            buildingID: '11231231'
        };

        const result = await request.post('/api/v1/user/post/assignBadmin')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingAdminsAfter = await helper.getNumberOfBuildingAdmins();
        expect(numberOfBuildingAdminsAfter).toEqual(numberOfBuildingAdminsBefore);
        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('buildingID');
    });


    afterAll(async () => {
        // !IMPORTANT NOTE: The sequence wich the tables are cleared is important as there are foreign keys.
        await helper.clearSessionsTable();
        await helper.clearRegistrationSecretsTable();
        void helper.clearBuildingAdminsTable();
        await helper.clearCompanyAdminsTable();
        await helper.clearAccountsTable();
        await database.closeDBConnection();
    });
});