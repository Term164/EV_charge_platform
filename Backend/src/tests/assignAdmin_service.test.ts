import { UserRegistrationRequest } from "../models/requestModels";
import database from "../utils/database";
import helper, { request } from "./helper";


let currentSessionID: string;

describe('assign admin service', () => {
    beforeAll(async () => {
        await database.establishDBConnection();

        helper.createExampleBuildings();
        helper.createExampleCompanies();

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

    test('assign new building admin', async () => {
        const numberOfBuildingAdminsBefore = await helper.getNumberOfBuildingAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: '1',
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
        const numberOfCompanyAdminsBefore = await helper.getNumberOfBuildingAdmins();

        const data = {
            sessionID: currentSessionID,
            userID: '1',
            companyID: '1'
        };

        await request.post('/api/v1/user/post/assignBadmin')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfCompanyAdminsAfter = await helper.getNumberOfBuildingAdmins();

        expect(numberOfCompanyAdminsAfter).toEqual(numberOfCompanyAdminsBefore+1);
    });

    afterAll(async () => {
        // !IMPORTANT NOTE: The sequence wich the tables are cleared is important as there are foreign keys.
        await helper.clearSessionsTable();
        await helper.clearRegistrationSecretsTable();
        void helper.clearBuildingAdminsTable();
        await helper.clearCompanyAdminsTable();
        void helper.clearBuildingsTable();
        void helper.clearCompaniesTable();
        await helper.clearAccountsTable();
        await database.closeDBConnection();
    });
});