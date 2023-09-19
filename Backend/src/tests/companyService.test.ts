import helper, { request } from "./helper";

describe('company service', () => {
    beforeAll( async () => {
        await helper.createExampleCompanies();
    });

    test('create new company', async () => {

        const data = {
            companyName: "dummy"
        };

        await request.post('/api/v1/company/post/new')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(await helper.checkCompanyExists(data.companyName)).toEqual(true);
    });

    test('get all companies', async () => {

        const response = await request.get('/api/v1/company/get/all')
            .send()
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body['Result'].length).toBeGreaterThan(2);
    });

    test('delete a company', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID('companyServiceTest');

        const data = {
            companyID: lastInsertedCompanyID
        };

        await request.delete('/api/v1/company/delete/company')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(await helper.checkCompanyExists('companyServiceTest')).toBe(false);
    });

    test('delete a company - fail', async () => {

        const data = {
            companyID: '1231124123'
        };

        await request.delete('/api/v1/company/delete/company')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

    });

    test('edit a company', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID('companyServiceTest2');
        const companyNameBefore = await helper.getCompanyName(lastInsertedCompanyID);

        expect(companyNameBefore).toEqual("companyServiceTest2");

        const data = {
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

    test('edit a company - fail', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID('CompanyServiceTest');

        const data = {
            companyID: lastInsertedCompanyID,
        };

        const response = await request.patch('/api/v1/company/patch/edit')
            .send(data)
            .expect(400);
        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Error");
    });
});