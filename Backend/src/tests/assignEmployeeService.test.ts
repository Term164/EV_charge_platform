import helper, { request } from "./helper";


let currentUserID: string;
let testBuildingID: number;
let testAdminID: number;
let testCompanyID: number;

describe('assign employee service', () => {
    beforeAll(async () => {

        currentUserID = String(await helper.insertNewUserReturningUserID("Term", "test", "test.com"));
        testBuildingID = await helper.insertDummyBuildingReturningID('assignEmployeeServiceTest');
        testCompanyID = await helper.insertDummyCompanyReturningID('assignEmployeeServiceTest');
        testAdminID = await helper.insertDummyCompanyAdminReturningID(currentUserID, String(testCompanyID));
    }, 10000);

    test('assign new employee to company', async () => {
        const data = {
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

        const data = {
            userID: '4123123',
            buildingID: String(testBuildingID),
            companyAdminID: String(testAdminID)
        };

        const result = await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('userID');

    });

    test('assign new employee to company', async () => {
        const data = {
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

    test('fail when trying to assign a new employee to a building that does not exist', async () => {

        const data = {
            userID: currentUserID,
            buildingID: '1231231',
            companyAdminID: String(testAdminID)
        };

        const result = await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('buildingID');

    });

    test('assign new employee to company', async () => {
        const data = {
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

        const data = {
            userID: currentUserID,
            buildingID: String(testBuildingID),
            companyAdminID: '123123123'
        };

        const result = await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body).toHaveProperty('Error');
        expect(result.body.Error).toContain('companyAdminID');

    });

    test('assign new employee to building', async () => {
        const data = {
            userID: currentUserID,
            buildingID: String(testBuildingID),
            companyAdminID: String(testAdminID)
        };

        await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('assign new employee to building that already has access', async () => {

        const data = {
            userID: currentUserID,
            buildingID: String(testBuildingID),
            companyAdminID: String(testAdminID)
        };

        await request.post('/api/v1/user/post/assignBuilding')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });
});