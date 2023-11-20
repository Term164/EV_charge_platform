import helper, { request } from "./helper";

let dummyChargingTypeID: number;
let dummyBuildingID: number;

describe('charging station service', () => {
    beforeAll( async () => {
        dummyChargingTypeID = await helper.insertDummyChargingTypeReturningID();
        dummyBuildingID = await helper.insertDummyBuildingReturningID("building-test");
    });

    test('create new charging station - success', async () => {
        await helper.clearStationsAndConnectors();
        const data = {
            buildingID: dummyBuildingID,
            stationName: "create-1",
            chargingConnectors: [
                {
                    chargingTypeID: dummyChargingTypeID,
                    serialNumber: 42
                }
            ]
        };

        await request.post('/api/v1/station/post/new')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(await helper.checkChargingStationExists(data.stationName)).toEqual(true);
        const stationID = await helper.getChargingStationIDFromName(data.stationName);
        expect(await helper.checkChargingConnectorExists(stationID, data.chargingConnectors[0].serialNumber)).toEqual(true);
    });

    test('create new charging station - fail: building id', async () => {
        await helper.clearStationsAndConnectors();
        const data = {
            buildingID: dummyBuildingID + 10000,
            stationName: "create-1",
            chargingConnectors: [
                {
                    chargingTypeID: dummyChargingTypeID,
                    serialNumber: 42
                }
            ]
        };

        const response = await request.post('/api/v1/station/post/new')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("building");
    });

    test('get all charging stations - 1 station, 1 connector', async () => {
        await helper.clearStationsAndConnectors();
        await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "test-1s-1c", dummyChargingTypeID);

        const data = {
        };

        const response = await request.get('/api/v1/station/get/all')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("Result");
        expect(response.body.data.Result).toBeInstanceOf(Array);
        expect(response.body.data.Result.length).toEqual(1);

        expect(response.body.data.Result[0]).toHaveProperty("chargingConnectors");
        expect(response.body.data.Result[0].chargingConnectors.length).toEqual(1);
    });

    test('get all charging stations - 1 station, 2 connectors', async () => {
        await helper.clearStationsAndConnectors();
        await helper.insertDummyChargingStationWithTwoConnectorsReturningID(dummyBuildingID, "test-1s-2c", dummyChargingTypeID);

        const data = {
        };

        const response = await request.get('/api/v1/station/get/all')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("Result");
        expect(response.body.data.Result).toBeInstanceOf(Array);
        expect(response.body.data.Result.length).toEqual(1);

        expect(response.body.data.Result[0]).toHaveProperty("chargingConnectors");
        expect(response.body.data.Result[0].chargingConnectors.length).toEqual(2);
    });

    test('get all charging stations - 2 stations, 1 connector each', async () => {
        await helper.clearStationsAndConnectors();
        await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "test-1s-1c", dummyChargingTypeID);
        await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "test-2s-1c", dummyChargingTypeID);

        const data = {
        };

        const response = await request.get('/api/v1/station/get/all')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("Result");
        expect(response.body.data.Result).toBeInstanceOf(Array);
        expect(response.body.data.Result.length).toEqual(2);

        expect(response.body.data.Result[0]).toHaveProperty("chargingConnectors");
        expect(response.body.data.Result[0].chargingConnectors.length).toEqual(1);
        expect(response.body.data.Result[1].chargingConnectors.length).toEqual(1);
    });

    test('get all available charging stations - normal employee', async () => {
    // creates a building, creates a station connected to the building, creates
    // a company assigned to building, creates a user with said company
    //-> that station is available to him
        await helper.clearStationsAndConnectors();
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID("dummy-building");
        await helper.insertDummyChargingStationWithOneConnectorReturningID(lastInsertedBuildingID, "get-all-available-1", dummyChargingTypeID);
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID("dummy-company");
        await helper.assignCompanyToBuilding(lastInsertedCompanyID, lastInsertedBuildingID);
        const lastInsertedUserID = await helper.insertDummyUserWithCompanyReturningID(lastInsertedCompanyID);

        const data = {
            userID: lastInsertedUserID
        };

        const response = await request.get('/api/v1/station/get/allAvailable')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("Result");
        expect(response.body.data.Result).toBeInstanceOf(Array);
        expect(response.body.data.Result.length).toEqual(1);
    });

    test('get all available charging stations - guest building access', async () => {
    // creates a building, creates a station connected to the building,
    // creates a user with no company (guest), but gives him building access
    // -> that station is available to him
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID("dummy-building-3");
        await helper.insertDummyChargingStationWithOneConnectorReturningID(lastInsertedBuildingID, "get-all-available-2", dummyChargingTypeID);
        const lastInsertedUserID = await helper.insertDummyUserWithCompanyReturningID(null);
        await helper.setBuildingAccessToUser(lastInsertedUserID, lastInsertedBuildingID);

        const data = {
            userID: lastInsertedUserID
        };

        const response = await request.get('/api/v1/station/get/allAvailable')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("Result");
        expect(response.body.data.Result).toBeInstanceOf(Array);
        expect(response.body.data.Result.length).toEqual(1);
    });

    test('get all available charging stations - multiple building accesses', async () => {
    // creates 2 buildings, creates 2 stations each connected to a different building,
    // creates a user with no company, but gives him building access to both buildings
    // -> both stations are available to him
        const buildingID_1 = await helper.insertDummyBuildingReturningID("dummy-building-4");
        const buildingID_2 = await helper.insertDummyBuildingReturningID("dummy-building-5");
        await helper.insertDummyChargingStationWithOneConnectorReturningID(buildingID_1, "get-all-available-3", dummyChargingTypeID);
        await helper.insertDummyChargingStationWithOneConnectorReturningID(buildingID_2, "get-all-available-4", dummyChargingTypeID);
        const lastInsertedUserID = await helper.insertDummyUserWithCompanyReturningID(null);
        await helper.setBuildingAccessToUser(lastInsertedUserID, buildingID_1);
        await helper.setBuildingAccessToUser(lastInsertedUserID, buildingID_2);

        const data = {
            userID: lastInsertedUserID
        };

        const response = await request.get('/api/v1/station/get/allAvailable')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("Result");
        expect(response.body.data.Result).toBeInstanceOf(Array);
        expect(response.body.data.Result.length).toEqual(2);
    });

    test('get all available charging stations - employe, station is reserved to different company', async () => {
    // creates a building, creates 2 stations connected to said building, creates
    // a company assigned to building, creates a user with said company, creates another company,
    // assigns one station to the other company
    // -> there are 2 stations connected to this building, but only 1 is available
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID("dummy-building-6");
        const stationID = await helper.insertDummyChargingStationWithOneConnectorReturningID(lastInsertedBuildingID, "get-all-available-5", dummyChargingTypeID);
        await helper.insertDummyChargingStationWithOneConnectorReturningID(lastInsertedBuildingID, "get-all-available-6", dummyChargingTypeID);
        const usersCompanyID = await helper.insertDummyCompanyReturningID("dummy-company");
        const anotherCompanyID = await helper.insertDummyCompanyReturningID("dummy-company-2");
        await helper.assignCompanyToBuilding(usersCompanyID, lastInsertedBuildingID);
        await helper.assignCompanyToBuilding(anotherCompanyID, lastInsertedBuildingID);
        const lastInsertedUserID = await helper.insertDummyUserWithCompanyReturningID(usersCompanyID);
        await helper.setCompanyIDOfChargingStation(stationID, anotherCompanyID);

        const data = {
            userID: lastInsertedUserID
        };

        const response = await request.get('/api/v1/station/get/allAvailable')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("Result");
        expect(response.body.data.Result).toBeInstanceOf(Array);
        expect(response.body.data.Result.length).toEqual(1);
    });

    test('delete a charging station - success', async () => {
        await helper.clearStationsAndConnectors();
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "delete-1", dummyChargingTypeID);

        const data = {
            stationID: lastInsertedChargingStationID
        };

        await request.delete('/api/v1/station/delete/station')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfChargingStationsAfter = await helper.getNumberOfChargingStations();
        expect(numberOfChargingStationsAfter).toEqual(0);
        expect(await helper.getNumberOfChargingConnectors(lastInsertedChargingStationID)).toEqual(0);
    });

    test('delete a charging station - fail', async () => {
        await helper.clearStationsAndConnectors();
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "delete-2", dummyChargingTypeID);

        const data = {
            stationID: lastInsertedChargingStationID+1000
        };

        const response = await request.delete('/api/v1/station/delete/station')
            .send(data)
            .expect(500)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("error");
        const numberOfChargingStationsAfter = await helper.getNumberOfChargingStations();
        expect(numberOfChargingStationsAfter).toEqual(1);
        expect(await helper.getNumberOfChargingConnectors(lastInsertedChargingStationID)).toEqual(1);
    });

    test('edit a charging station - all params', async () => {
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "edit-1", dummyChargingTypeID);

        const otherBuildingID = await helper.insertDummyBuildingReturningID("dummy-building-7");

        const data = {
            stationID: lastInsertedChargingStationID,
            newBuildingID: otherBuildingID,
            newStationName: "eidt-1-modified"
        };

        await request.patch('/api/v1/station/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [buildingIDAfter, stationNameAfter] = await helper.getChargingStationData(lastInsertedChargingStationID);

        expect(buildingIDAfter).toEqual(data.newBuildingID);
        expect(stationNameAfter).toEqual(data.newStationName);
    });

    test('edit a charging station - name', async () => {
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "edit-2", dummyChargingTypeID);
        const [buildingIDBefore, stationNameBefore] = await helper.getChargingStationData(lastInsertedChargingStationID);

        expect(stationNameBefore).toEqual("edit-2");

        const data = {
            stationID: lastInsertedChargingStationID,
            newStationName: "edit-2-modified"
        };

        await request.patch('/api/v1/station/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [buildingIDAfter, stationNameAfter] = await helper.getChargingStationData(lastInsertedChargingStationID);

        expect(buildingIDBefore).toEqual(buildingIDAfter);
        expect(stationNameAfter).toEqual(data.newStationName);
    });

    test('edit a charging station - buildingID, fail', async () => {
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "edit-3", dummyChargingTypeID);
        const [buildingIDBefore, stationNameBefore] = await helper.getChargingStationData(lastInsertedChargingStationID);

        const data = {
            stationID: lastInsertedChargingStationID,
            newBuildingID: dummyBuildingID+10000
        };

        const response = await request.patch('/api/v1/station/patch/edit')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("error");

        const [buildingIDAfter, stationNameAfter] = await helper.getChargingStationData(lastInsertedChargingStationID);

        expect(buildingIDBefore).toEqual(buildingIDAfter);
        expect(stationNameBefore).toEqual(stationNameAfter);
    });

    test('assign a station to a company', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID("dummy-company-assign-1");
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "assign-1", dummyChargingTypeID);

        expect(await helper.getCompanyIDOfChargingStation(lastInsertedChargingStationID)).toEqual(null);

        const data = {
            stationID: lastInsertedChargingStationID,
            companyID: lastInsertedCompanyID
        };

        await request.post('/api/v1/station/post/assignCompany')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(await helper.getCompanyIDOfChargingStation(lastInsertedChargingStationID)).toEqual(lastInsertedCompanyID);
    });

    test('assign a station to a company - clear', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID("dummy-company-assign-2");
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "assign-2", dummyChargingTypeID);
        await helper.setCompanyIDOfChargingStation(lastInsertedChargingStationID, lastInsertedCompanyID);

        expect(await helper.getCompanyIDOfChargingStation(lastInsertedChargingStationID)).toEqual(lastInsertedCompanyID);

        const data = {
            stationID: lastInsertedChargingStationID,
            companyID: null
        };

        await request.post('/api/v1/station/post/assignCompany')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(await helper.getCompanyIDOfChargingStation(lastInsertedChargingStationID)).toEqual(null);
    });
});
