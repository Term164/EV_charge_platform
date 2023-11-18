import helper, { request } from "./helper";
import crypto from 'crypto';


let normalUserSessionID: string;
let bAdminSessionID: string;
let cAdminUserSessionID: string;

let userID: string;
let bAdminID: string;
let cAdminID: string;

describe('authorization middleware checker', () => {

    beforeAll(async () => {
        userID = await helper.insertNewUserReturningUserID("test","test","test");
        normalUserSessionID = crypto.randomBytes(20).toString('hex');
        await helper.insertDummySession(Number.parseInt(userID), normalUserSessionID);

        bAdminID = await helper.createNewBuildingAdmin();
        bAdminSessionID = crypto.randomBytes(20).toString('hex');
        await helper.insertDummySession(Number.parseInt(bAdminID), bAdminSessionID);

        cAdminID = await helper.createNewCompanyAdmin();
        cAdminUserSessionID = crypto.randomBytes(20).toString('hex');
        await helper.insertDummySession(Number.parseInt(cAdminID), cAdminUserSessionID);


    });

    test('API call that needs no authorization', async () => {
        const response = await request.get('/api/v1/dev/ping')
            .send({sessionID: normalUserSessionID, sessionTest: true})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toEqual('pong');
    });

    test('Fail badmin API call with normal user',async () => {
        const response = await request.get('/api/v1/building/get/all')
            .send({sessionID: normalUserSessionID, sessionTest: true})
            .expect(403)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('You are not a building administrator and cannot make a request to this API endpoint');
    });

    test('Fail cadmin API call with normal user',async () => {
        const response = await request.get('/api/v1/building/get/companyOwned')
            .send({sessionID: normalUserSessionID, sessionTest: true})
            .expect(403)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('You are not a company administrator and cannot make a request to this API endpoint');
    });

    test('badmin API call with badmin account',async () => {
        const response = await request.get('/api/v1/building/get/all')
            .send({sessionID: bAdminSessionID, sessionTest: true})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toBeDefined();
    });

    test('cadmin API call with cadmin account',async () => {
        const response = await request.get('/api/v1/building/get/companyOwned')
            .send({sessionID: cAdminUserSessionID, companyID: 1, sessionTest: true})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toBeDefined();
    });

    test('Fail badmin API call with cadmin account',async () => {
        const response = await request.get('/api/v1/building/get/all')
            .send({sessionID: cAdminUserSessionID, sessionTest: true})
            .expect(403)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('You are not a building administrator and cannot make a request to this API endpoint');
    });

    test('Fail cadmin API call with badmin account',async () => {
        const response = await request.get('/api/v1/building/get/companyOwned')
            .send({sessionID: bAdminSessionID, sessionTest: true})
            .expect(403)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('You are not a company administrator and cannot make a request to this API endpoint');
    });
});