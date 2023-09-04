import helper, { request } from "./helper";


let currentUserID: string;
let testCompanyID: number;
let testBuildingID: number;

describe('assign admin service', () => {
    beforeAll(async () => {

        currentUserID = String(await helper.insertNewUserReturningUserID("Term", "test", "test.com"));
        testCompanyID = await helper.insertDummyCompanyReturningID();
        testBuildingID = await helper.insertDummyBuildingReturningID();
    }, 10000);

    test('assign new building admin', async () => {
        const numberOfBuildingAdminsBefore = await helper.getNumberOfBuildingAdmins();

        const data = {
            userID: currentUserID,
            buildingID: String(testBuildingID)
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
            userID: currentUserID,
            companyID: String(testCompanyID)
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
            userID: currentUserID,
            buildingID: String(testBuildingID)
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
            userID: currentUserID,
            companyID: String(testCompanyID)
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
            userID: '12312312',
            companyID: String(testCompanyID)
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
            userID: '12312312',
            buildingID: String(testBuildingID)
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
});