import helper, { request } from "./helper";

describe('charging type service', () => {
    beforeAll( async () => {
        //await helper.createExampleBuildings();
    });

    test('create new charging type', async () => {

        const data = {
            chargingType: "15W - test"
        };

        await request.post('/api/v1/station/type/post/new')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(await helper.checkChargingTypeExists(data.chargingType)).toEqual(true);
    });

    test('get all charging types', async () => {
        const numberOfChargingTypes = await helper.getNumberOfChargingTypes();

        const data = {
        };

        const response = await request.get('/api/v1/station/type/get/all')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Result");
        const numberOfChargingTypesReturned = response.body.Result.length as number;

        expect(numberOfChargingTypes).toEqual(numberOfChargingTypesReturned);
    });

    test('delete a charging type - success', async () => {
        const lastInsertedChargingTypeID = await helper.insertDummyChargingTypeReturningID();
        const numberOfChargingTypesBefore = await helper.getNumberOfChargingTypes();

        const data = {
            chargingTypeID: lastInsertedChargingTypeID
        };

        await request.delete('/api/v1/station/type/delete/type')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfChargingTypesAfter = await helper.getNumberOfChargingTypes();

        expect(numberOfChargingTypesAfter).toEqual(numberOfChargingTypesBefore-1);
    });

    test('delete a charging type - fail', async () => {
        const lastInsertedChargingTypeID = await helper.insertDummyChargingTypeReturningID();
        const numberOfChargingTypesBefore = await helper.getNumberOfChargingTypes();

        const data = {
            chargingTypeID: lastInsertedChargingTypeID+1000
        };

        const response = await request.delete('/api/v1/station/type/delete/type')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("Error");
        const numberOfChargingTypesAfter = await helper.getNumberOfChargingTypes();

        expect(numberOfChargingTypesAfter).toEqual(numberOfChargingTypesBefore);
    });

    test('edit a charging type', async () => {
        const lastInsertedChargingTypeID = await helper.insertDummyChargingTypeReturningID();
        const chargingTypeBefore = await helper.getChargingType(lastInsertedChargingTypeID);

        expect(chargingTypeBefore).toEqual("dummy-test");

        const data = {
            chargingTypeID: lastInsertedChargingTypeID,
            newChargingType: "dummy-test-2",
        };

        await request.patch('/api/v1/station/type/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const chargingTypeAfter = await helper.getChargingType(lastInsertedChargingTypeID);

        expect(chargingTypeAfter).toEqual("dummy-test-2");
    });

});





