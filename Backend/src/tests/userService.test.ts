import helper, { request } from "./helper";

let currentUserID: string;
let testCompanyID: number;
let testBuildingID: number;
let companyAdminID: number;
// let buildingAdminID: number;

describe('get all admins', () => {
    beforeAll(async () => {
        currentUserID = String(await helper.insertNewUserReturningUserID("Term", "test", "test.com"));
        testCompanyID = await helper.insertDummyCompanyReturningID('dummy');
        testBuildingID = await helper.insertDummyBuildingReturningID('dummy');
        companyAdminID = await helper.insertDummyCompanyAdminReturningID(currentUserID, String(testCompanyID));
        await helper.insertDummyBuildingAdminReturningID(currentUserID, String(testBuildingID));
    });

    test('get all company admins', async () => {
        const result = await request.get('/api/v1/user/get/companyAdmins')
            .send()
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(Array.isArray(result.body.data.result)).toBe(true);
        expect(result.body.data.result[0]['account']['username']).toBe('Term');
    });

    test('get all building admins', async () => {

        const result = await request.get('/api/v1/user/get/buildingAdmins')
            .send()
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(Array.isArray(result.body.data.result)).toBe(true);
        expect(result.body.data.result[0]['account']['username']).toBe('Term');
    });

    test('get assigned building admins', async () => {
        const result = await request.get('/api/v1/user/get/assignedBadmins')
            .send({buildingID: String(testBuildingID)})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(Array.isArray(result.body.data.result)).toBe(true);
        expect(result.body.data.result[0]['account']['username']).toBe('Term');
    });


    test('get assigned company admins', async () => {
        const result = await request.get('/api/v1/user/get/assignedCadmins')
            .send({companyID: String(testCompanyID)})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(result.body.data).toHaveProperty('result');
        expect(Array.isArray(result.body.data.result)).toBe(true);
        expect(result.body.data.result[0]['account']['username']).toBe('Term');
    });

    test('fail assignedBadmins with missing buildingID', async () => {
        const result = await request.get('/api/v1/user/get/assignedBadmins')
            .send()
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toBe('parameter buildingID missing');
    });

    test('fail assignedCadmins with missing companyID', async () => {
        const result = await request.get('/api/v1/user/get/assignedCadmins')
            .send()
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toBe('parameter companyID missing');
    });

    test('delete user account', async () => {
        const testUserID = String(await helper.insertNewUserReturningUserID("random", "test123", "123test.com"));
        const result = await request.delete('/api/v1/user/delete/account')
            .send({userID: testUserID})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toBe('User deleted successfully');
        expect(await helper.checkUserExists("random")).toBe(false);
    });

    test('delete building_access', async () => {
        void await helper.insertUserBuildingAccess(currentUserID, String(testBuildingID), String(companyAdminID));

        const result = await request.delete('/api/v1/user/delete/building_access')
            .send({userID: String(currentUserID), buildingID: String(testBuildingID)})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toContain('Successfully');
        expect(await helper.checkUserHasBuildingAccess(String(currentUserID), String(testBuildingID))).toEqual(false);
    });

    test('Succesfully edit user profile', async () => {
        const result = await request.patch('/api/v1/user/patch/editProfile')
            .send({userID: String(currentUserID), companyID: String(testCompanyID)})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toContain('Successfully');
        expect(await helper.getUserAssignedCompanyID(String(currentUserID))).toEqual(testCompanyID);
    });

    test('Successfully delete company admin', async () => {
        const companyAdminID = await helper.createNewCompanyAdmin();

        const result = await request.delete('/api/v1/user/delete/cadmin')
            .send({userID: String(companyAdminID)})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toContain('operation completed successfully');
        expect(await helper.checkCAdminExists(companyAdminID)).toBe(false);
    });

    test('Successfully delete building admin', async () => {
        const buildingAdminID = await helper.createNewBuildingAdmin();

        const result = await request.delete('/api/v1/user/delete/badmin')
            .send({userID: String(buildingAdminID)})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(result.body.message).toContain('operation completed successfully');
        expect(await helper.checkBAdminExists(buildingAdminID)).toBe(false);
    });

});