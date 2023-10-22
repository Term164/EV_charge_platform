import helper, { request } from "./helper";

let dummyChargingTypeID: number;
let dummyBuildingID: number;

describe('charging station service', () => {
    beforeAll( async () => {
        dummyChargingTypeID = await helper.insertDummyChargingTypeReturningID();
        dummyBuildingID = await helper.insertDummyBuildingReturningID("building-test");
    });

    test('create new charging station', async () => {
        const data = {
            chargingTypeID: dummyChargingTypeID,
            buildingID: dummyBuildingID,
            stationName: "station-test"
        };

        await request.post('/api/v1/station/post/new')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(await helper.checkChargingStationExists(data.stationName)).toEqual(true);
    });

    test('get all charging stations', async () => {
        const numberOfChargingStations = await helper.getNumberOfChargingStations();

        const data = {
        };

        const response = await request.get('/api/v1/station/get/all')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("Result");
        const numberOfChargingStationsReturned = response.body.data.Result.length as number;

        expect(numberOfChargingStations).toEqual(numberOfChargingStationsReturned);
    });

    test('get all available charging stations - normal employee', async () => {
    /* creates a building, creates a station connected to the building, creates
    a company assigned to building, creates a user with said company
    -> that station is available to him
    */
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID("dummy-building");
        await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, lastInsertedBuildingID);
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID("dummy-building-2");
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
        const numberOfChargingStationsReturned = response.body.data.Result.length as number;

        expect(numberOfChargingStationsReturned).toEqual(1);
    });

    test('get all available charging stations - guest building access', async () => {
    /* creates a building, creates a station connected to the building,
    creates a user with no company (guest), but gives him building access
    -> that station is available to him
    */
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID("dummy-building-3");
        await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, lastInsertedBuildingID);
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
        const numberOfChargingStationsReturned = response.body.data.Result.length as number;

        expect(numberOfChargingStationsReturned).toEqual(1);
    });

    test('get all available charging stations - multiple building accesses', async () => {
    /* creates 2 buildings, creates 2 stations each connected to a different building,
    creates a user with no company, but gives him building access to both buildings
    -> both stations are available to him
    */
        const buildingID_1 = await helper.insertDummyBuildingReturningID("dummy-building-4");
        const buildingID_2 = await helper.insertDummyBuildingReturningID("dummy-building-5");
        await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, buildingID_1);
        await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, buildingID_2);
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
        const numberOfChargingStationsReturned = response.body.data.Result.length as number;

        expect(numberOfChargingStationsReturned).toEqual(2);
    });

    test('get all available charging stations - employe, station is reserved to different company', async () => {
    /* creates a building, creates 2 stations connected to said building, creates
    a company assigned to building, creates a user with said company, creates another company,
    assigns one station to the other company
    -> there are 2 stations connected to this building, but only 1 is available
    */
        const lastInsertedBuildingID = await helper.insertDummyBuildingReturningID("dummy-building-6");
        const stationID = await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, lastInsertedBuildingID);
        await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, lastInsertedBuildingID);
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
        const numberOfChargingStationsReturned = response.body.data.Result.length as number;

        expect(numberOfChargingStationsReturned).toEqual(1);
    });

    test('delete a charging station - success', async () => {
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, dummyBuildingID);
        const numberOfChargingStationsBefore = await helper.getNumberOfChargingStations();

        const data = {
            stationID: lastInsertedChargingStationID
        };

        await request.delete('/api/v1/station/delete/station')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const numberOfChargingStationsAfter = await helper.getNumberOfChargingStations();

        expect(numberOfChargingStationsAfter).toEqual(numberOfChargingStationsBefore-1);
    });

    test('delete a charging station - fail', async () => {
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, dummyBuildingID);
        const numberOfChargingStationsBefore = await helper.getNumberOfChargingStations();

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

        expect(numberOfChargingStationsAfter).toEqual(numberOfChargingStationsBefore);
    });

    test('edit a charging station - all params', async () => {
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, dummyBuildingID);
        //const [chargingTypeIDBefore, buildingIDBefore, stationNameBefore] = await helper.getChargingStationData(lastInsertedChargingStationID);

        const otherChargingTypeID = await helper.insertDummyChargingTypeReturningID();
        const otherBuildingID = await helper.insertDummyBuildingReturningID("dummy-building-7");

        const data = {
            stationID: lastInsertedChargingStationID,
            newTypeID: otherChargingTypeID,
            newBuildingID: otherBuildingID,
            newStationName: "station-test-2"
        };

        await request.patch('/api/v1/station/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [chargingTypeIDAfter, buildingIDAfter, stationNameAfter] = await helper.getChargingStationData(lastInsertedChargingStationID);

        expect(chargingTypeIDAfter).toEqual(data.newTypeID);
        expect(buildingIDAfter).toEqual(data.newBuildingID);
        expect(stationNameAfter).toEqual(data.newStationName);
    });

    test('edit a charging station - name', async () => {
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, dummyBuildingID);
        const [chargingTypeIDBefore, buildingIDBefore, stationNameBefore] = await helper.getChargingStationData(lastInsertedChargingStationID);

        expect(stationNameBefore).toEqual("station-test");

        const data = {
            stationID: lastInsertedChargingStationID,
            newStationName: "station-test-2",
        };

        await request.patch('/api/v1/station/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [chargingTypeIDAfter, buildingIDAfter, stationNameAfter] = await helper.getChargingStationData(lastInsertedChargingStationID);

        expect(chargingTypeIDBefore).toEqual(chargingTypeIDAfter);
        expect(buildingIDBefore).toEqual(buildingIDAfter);
        expect(stationNameAfter).toEqual(data.newStationName);
    });

    test('edit a charging station - buildingID, fail', async () => {
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, dummyBuildingID);
        const [chargingTypeIDBefore, buildingIDBefore, stationNameBefore] = await helper.getChargingStationData(lastInsertedChargingStationID);

        const data = {
            stationID: lastInsertedChargingStationID,
            newBuildingID: dummyBuildingID+10000
        };

        await request.patch('/api/v1/station/patch/edit')
            .send(data)
            .expect(500)
            .expect('Content-Type', /application\/json/);

        const [chargingTypeIDAfter, buildingIDAfter, stationNameAfter] = await helper.getChargingStationData(lastInsertedChargingStationID);

        expect(chargingTypeIDBefore).toEqual(chargingTypeIDAfter);
        expect(buildingIDBefore).toEqual(buildingIDAfter);
        expect(stationNameBefore).toEqual(stationNameAfter);
    });

    test('assign a station to a company', async () => {
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID("dummy-company-3");
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, dummyBuildingID);

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
        const lastInsertedCompanyID = await helper.insertDummyCompanyReturningID("dummy-company-4");
        const lastInsertedChargingStationID = await helper.insertDummyChargingStationReturningID(dummyChargingTypeID, dummyBuildingID);
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
