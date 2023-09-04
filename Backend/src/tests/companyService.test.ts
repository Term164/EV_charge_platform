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
        const numberOfCompanies = await helper.getNumberOfCompanies();

        const data = {
        };

        const response = await request.get('/api/v1/company/get/all')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Result");
        const numberOfCompaniesReturned = response.body.Result.length as number;

        expect(numberOfCompanies).toEqual(numberOfCompaniesReturned);
    });

    test('delete a company', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID();
        const numberOfCompaniesBefore = await helper.getNumberOfCompanies();

        const data = {
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
});





