import { UserRegistrationRequest } from "../models/requestModels";
import database from "../utils/database";
import helper, { request } from "./helper";

let currentSessionID: string;

describe('company service', () => {
    beforeAll(async () => {
        await database.establishDBConnection();

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

    test('create new company', async () => {
        const numberOfCompaniesBefore = await helper.getNumberOfCompanies();

        const data = {
            sessionID: currentSessionID,
            companyName: "dummy"
        };

        await request.post('/api/v1/company/post/new')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfCompaniesAfter = await helper.getNumberOfCompanies();

        expect(numberOfCompaniesAfter).toEqual(numberOfCompaniesBefore+1);

    });

    test('get all companies', async () => {
        const numberOfCompanies = await helper.getNumberOfCompanies();

        const data = {
            sessionID: currentSessionID
        };

        const response = await request.get('/api/v1/company/get/all')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Result");
        const numberOfCompaniesReturned = response.body.Result.length;

        expect(numberOfCompanies).toEqual(numberOfCompaniesReturned);
    });

    test('delete a company', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID();
        const numberOfCompaniesBefore = await helper.getNumberOfCompanies();

        const data = {
            sessionID: currentSessionID,
            companyID: lastInsertedCompanyID
        };

        await request.delete('/api/v1/company/delete/company')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfCompaniesAfter = await helper.getNumberOfCompanies();

        expect(numberOfCompaniesAfter).toEqual(numberOfCompaniesBefore-1);

    });

    test('edit a company', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID();
        const companyNameBefore = await helper.getCompanyName(lastInsertedCompanyID);
        
        expect(companyNameBefore).toEqual("dummy");

        const data = {
            sessionID: currentSessionID,
            companyID: lastInsertedCompanyID,
            newCompanyName: "MICROSOFT"
        };

        await request.patch('/api/v1/company/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const companyNameAfter = await helper.getCompanyName(lastInsertedCompanyID);

        expect(companyNameAfter).toEqual("MICROSOFT");
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





