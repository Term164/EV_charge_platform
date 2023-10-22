import helper, { request } from "./helper";


let currentUserID: string;
let testCompanyID: number;
let testBuildingID: number;

describe('assign admin service', () => {
    beforeAll(async () => {

        currentUserID = String(await helper.insertNewUserReturningUserID("Term", "test", "test.com"));
        testCompanyID = await helper.insertDummyCompanyReturningID('assignAdminTest');
        testBuildingID = await helper.insertDummyBuildingReturningID('assignAdminTest');
    }, 10000);

    test('assign new building admin', async () => {
        const data = {
            userID: currentUserID,
            buildingID: String(testBuildingID)
        };

        await request.post('/api/v1/user/post/assignBadmin')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(await helper.checkBAdminExists(currentUserID)).toBe(true);
    });

    test('assign new company admin', async () => {
        const data = {
            userID: currentUserID,
            companyID: String(testCompanyID)
        };

        await request.post('/api/v1/user/post/assignCadmin')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(await helper.checkCAdminExists(currentUserID)).toBe(true);
    });

    test('assign new building admin that has already been set', async () => {

        const data = {
            userID: currentUserID,
            buildingID: String(testBuildingID)
        };

        await request.post('/api/v1/user/post/assignBadmin')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('assign new company admin that has already been set', async () => {

        const data = {
            userID: currentUserID,
            companyID: String(testCompanyID)
        };

        await request.post('/api/v1/user/post/assignCadmin')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('assign user that does not exist to company admins', async () => {

        const data = {
            userID: '12312312',
            companyID: String(testCompanyID)
        };

        const result = await request.post('/api/v1/user/post/assignCadmin')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toContain('userID');
    });

    test('assign user that does not exist to building admins', async () => {
        const data = {
            userID: '12312312',
            buildingID: String(testBuildingID)
        };

        const result = await request.post('/api/v1/user/post/assignBadmin')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toContain('userID');
    });

    test('assign user to company admins for company that does not exist', async () => {
        const data = {
            userID: currentUserID,
            companyID: '11231231'
        };

        const result = await request.post('/api/v1/user/post/assignCadmin')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toContain('companyID');
    });

    test('assign user to building admins for a building that does not exist', async () => {
        const data = {
            userID: currentUserID,
            buildingID: '11231231'
        };

        const result = await request.post('/api/v1/user/post/assignBadmin')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toContain('buildingID');
    });
});