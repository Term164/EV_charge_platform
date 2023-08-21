import { UserRegistrationRequest } from "../models/requestModels";
import database from "../utils/database";
import helper, { request } from "./helper";


let currentSessionID: string;
let currentUserID: string;
let testBuildingID: number;
let testAdminID: number;

describe('assign employee service', () => {
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

        testBuildingID = await helper.insertDummyBuildingReturningID();
        testAdminID = await helper.insertDummyCompanyAdminReturningID(currentUserID);
    }, 10000);

    test('assign new employee to building', async () => {
        const numberOfBuildingAccessesBefore = await helper.getNumberOfBuildingAccesses();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            buildingID: String(testBuildingID),
            companyAdminID: testAdminID
        };

        await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingAccessesAfter = await helper.getNumberOfBuildingAccesses();

        expect(numberOfBuildingAccessesAfter).toEqual(numberOfBuildingAccessesBefore+1);

    });

    afterAll(async () => {
        // !IMPORTANT NOTE: The sequence wich the tables are cleared is important as there are foreign keys.
        await helper.clearSessionsTable();
        await helper.clearRegistrationSecretsTable();
        await helper.clearBuildingAccessesTable();
        await helper.clearAccountsTable();
        await database.closeDBConnection();
    });
});