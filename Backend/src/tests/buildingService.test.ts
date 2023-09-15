import helper, { request } from "./helper";

describe('building service', () => {
    beforeAll( async () => {
        await helper.createExampleBuildings();
    });

    test('create new building', async () => {

        const data = {
            buildingName: "dummy",
            buildingLocation: "dummy_location"
        };

        await request.post('/api/v1/building/post/new')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(await helper.checkBuildingExists(data.buildingName)).toEqual(true);
    });

    test('get all buildings', async () => {
        const numberOfBuildings = await helper.getNumberOfBuildings();

        const data = {
        };

        const response = await request.get('/api/v1/building/get/all')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Result");
        const numberOfBuildingsReturned = response.body.Result.length as number;

        expect(numberOfBuildings).toEqual(numberOfBuildingsReturned);
    });

    test('delete a building - success', async () => {
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID();
        const numberOfBuildingsBefore = await helper.getNumberOfBuildings();

        const data = {
            buildingID: lastInsertedBuildingID
        };

        await request.delete('/api/v1/building/delete/building')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfBuildingsAfter = await helper.getNumberOfBuildings();

        expect(numberOfBuildingsAfter).toEqual(numberOfBuildingsBefore-1);
    });

    test('delete a building - fail', async () => {
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID();
        const numberOfBuildingsBefore = await helper.getNumberOfBuildings();

        const data = {
            buildingID: lastInsertedBuildingID+1000
        };

        const response = await request.delete('/api/v1/building/delete/building')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Error");
        const numberOfBuildingsAfter = await helper.getNumberOfBuildings();

        expect(numberOfBuildingsAfter).toEqual(numberOfBuildingsBefore);
    });

    test('edit a building - all params', async () => {
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID();
        const [buildingNameBefore, buildingLocationBefore] = await helper.getBuildingData(lastInsertedBuildingID);

        expect(buildingNameBefore).toEqual("dummy");
        expect(buildingLocationBefore).toEqual("location");

        const data = {
            buildingID: lastInsertedBuildingID,
            newBuildingName: "dummy_version_2",
            newBuildingLocation: "location_version_2"
        };

        await request.patch('/api/v1/building/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [buildingNameAfter, buildingLocationAfter] = await helper.getBuildingData(lastInsertedBuildingID);

        expect(buildingNameAfter).toEqual("dummy_version_2");
        expect(buildingLocationAfter).toEqual("location_version_2");
    });

    test('edit a building - first param', async () => {
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID();
        const [buildingNameBefore, buildingLocationBefore] = await helper.getBuildingData(lastInsertedBuildingID);

        expect(buildingNameBefore).toEqual("dummy");
        expect(buildingLocationBefore).toEqual("location");

        const data = {
            buildingID: lastInsertedBuildingID,
            newBuildingName: "dummy_version_2",
        };

        await request.patch('/api/v1/building/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [buildingNameAfter, buildingLocationAfter] = await helper.getBuildingData(lastInsertedBuildingID);

        expect(buildingNameAfter).toEqual("dummy_version_2");
        expect(buildingLocationAfter).toEqual("location");
    });

    test('edit a building - last param', async () => {
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID();
        const [buildingNameBefore, buildingLocationBefore] = await helper.getBuildingData(lastInsertedBuildingID);

        expect(buildingNameBefore).toEqual("dummy");
        expect(buildingLocationBefore).toEqual("location");

        const data = {
            buildingID: lastInsertedBuildingID,
            newBuildingLocation: "location_version_2"
        };

        await request.patch('/api/v1/building/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [buildingNameAfter, buildingLocationAfter] = await helper.getBuildingData(lastInsertedBuildingID);

        expect(buildingNameAfter).toEqual("dummy");
        expect(buildingLocationAfter).toEqual("location_version_2");
    });

    test('edit a building - no params', async () => {
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID();
        const [buildingNameBefore, buildingLocationBefore] = await helper.getBuildingData(lastInsertedBuildingID);

        expect(buildingNameBefore).toEqual("dummy");
        expect(buildingLocationBefore).toEqual("location");

        const data = {
            buildingID: lastInsertedBuildingID
        };

        await request.patch('/api/v1/building/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [buildingNameAfter, buildingLocationAfter] = await helper.getBuildingData(lastInsertedBuildingID);

        expect(buildingNameAfter).toEqual("dummy");
        expect(buildingLocationAfter).toEqual("location");
    });

    // Fails becuase the unique constraint is missing ?!?!?!
    test('assign a company to a building', async () => {
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID();
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID();

        const data = {
            companyID: lastInsertedCompanyID,
            buildingID: lastInsertedBuildingID
        };

        await request.post('/api/v1/building/post/assignCompany')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(await helper.checkCompanyAssignedToBuildingExists(lastInsertedBuildingID, lastInsertedCompanyID)).toEqual(true);
    });

    test('get all assigned companies in a building - none', async () => {
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID();

        const data = {
            buildingID: lastInsertedBuildingID
        };

        const response = await request.get('/api/v1/building/get/assignedCompanies')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Result");
        const numberOfAssignedCompanies = response.body.Result.length as number;

        expect(numberOfAssignedCompanies).toEqual(0);
    });

    test('get all assigned companies in a building - multiple', async () => {
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID();
        await helper.insertCompaniesAssignedToBuilding(lastInsertedBuildingID);

        const data = {
            buildingID: lastInsertedBuildingID
        };

        const response = await request.get('/api/v1/building/get/assignedCompanies')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Result");
        const numberOfAssignedCompanies = response.body.Result.length as number;

        expect(numberOfAssignedCompanies).toEqual(3);
    });

    test('get all company owned buildings - none', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID();

        const data = {
            companyID: lastInsertedCompanyID
        };

        const response = await request.get('/api/v1/building/get/companyOwned')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Result");
        const numberOfAssignedCompanies = response.body.Result.length as number;

        expect(numberOfAssignedCompanies).toEqual(0);
    });

    test('get all company owned buildings - multiple', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID();
        await helper.insertBuildingsOwnedByCompany(lastInsertedCompanyID);

        const data = {
            companyID: lastInsertedCompanyID
        };

        const response = await request.get('/api/v1/building/get/companyOwned')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Result");
        const numberOfAssignedCompanies = response.body.Result.length as number;

        expect(numberOfAssignedCompanies).toEqual(3);
    });
});





