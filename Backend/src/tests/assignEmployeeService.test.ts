import { UserRegistrationRequest } from "../models/requestModels";
import database from "../utils/database";
import helper, { request } from "./helper";


let currentSessionID: string;
let currentUserID: string;
let testBuildingID: number;
let testAdminID: number;
let testCompanyID: number;

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
        testCompanyID = await helper.insertDummyCompanyReturningID();
        testAdminID = await helper.insertDummyCompanyAdminReturningID(currentUserID, String(testCompanyID));
    }, 10000);

    test('assign new employee to building', async () => {
        const numberOfBuildingAccessesBefore = await helper.getNumberOfBuildingAccesses();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            buildingID: String(testBuildingID),
            companyAdminID: String(testAdminID)
        };

        await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingAccessesAfter = await helper.getNumberOfBuildingAccesses();

        expect(numberOfBuildingAccessesAfter).toEqual(numberOfBuildingAccessesBefore+1);

    });

    test('assign new employee to company', async () => {
        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            companyID: String(testCompanyID)
        };

        await request.post('/api/v1/user/post/assignCompany')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(await helper.getUserAssignedCompanyID(currentUserID)).toEqual(testCompanyID);
    });

    test('fail when trying to assign a new employee that does not exist to building', async () => {
        const numberOfBuildingAccessesBefore = await helper.getNumberOfBuildingAccesses();

        const data = {
            sessionID: currentSessionID,
            userID: '4123123',
            buildingID: String(testBuildingID),
            companyAdminID: String(testAdminID)
        };

        const result = await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingAccessesAfter = await helper.getNumberOfBuildingAccesses();

        expect(numberOfBuildingAccessesAfter).toEqual(numberOfBuildingAccessesBefore);
        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('userID');

    });

    test('assign new employee to company', async () => {
        const data = {
            sessionID: currentSessionID,
            userID: '45123123',
            companyID: String(testCompanyID)
        };

        const result = await request.post('/api/v1/user/post/assignCompany')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(await helper.getUserAssignedCompanyID(currentUserID)).toEqual(testCompanyID);
        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('userID');
    });

    test('fail when trying to assign a new employee that does not exist to building', async () => {
        const numberOfBuildingAccessesBefore = await helper.getNumberOfBuildingAccesses();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            buildingID: '1231231',
            companyAdminID: String(testAdminID)
        };

        const result = await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingAccessesAfter = await helper.getNumberOfBuildingAccesses();

        expect(numberOfBuildingAccessesAfter).toEqual(numberOfBuildingAccessesBefore);
        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('buildingID');

    });

    test('assign new employee to company', async () => {
        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            companyID: '123123123'
        };

        const result = await request.post('/api/v1/user/post/assignCompany')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(await helper.getUserAssignedCompanyID(currentUserID)).toEqual(testCompanyID);
        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('companyID');
    });

    test('fail when trying to assign a new employee that does not exist to building', async () => {
        const numberOfBuildingAccessesBefore = await helper.getNumberOfBuildingAccesses();

        const data = {
            sessionID: currentSessionID,
            userID: currentUserID,
            buildingID: String(testBuildingID),
            companyAdminID: '123123123'
        };

        const result = await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingAccessesAfter = await helper.getNumberOfBuildingAccesses();

        expect(numberOfBuildingAccessesAfter).toEqual(numberOfBuildingAccessesBefore);
        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('companyAdminID');

    });


    // TODO: Check that the number of building_accesses rows does not grow if a duplicate account_id and building_id is inserted

    afterAll(async () => {
        // !IMPORTANT NOTE: The sequence wich the tables are cleared is important as there are foreign keys.
        await helper.clearSessionsTable();
        await helper.clearRegistrationSecretsTable();
        await helper.clearBuildingAccessesTable();
        await helper.clearBuildingsTable();
        await helper.clearCompanyAdminsTable();
        await helper.clearAccountsTable();
        await database.closeDBConnection();
    });
});