import helper, { request } from "./helper";

let dummyChargingTypeID: number;
let dummyBuildingID: number;

describe('charging connector service', () => {
    beforeAll( async () => {
        dummyChargingTypeID = await helper.insertDummyChargingTypeReturningID();
        dummyBuildingID = await helper.insertDummyBuildingReturningID("building-test");
    });

    test('create new charging connector - assign', async () => {
        await helper.clearStationsAndConnectors();
        const dummyStationID = await helper.insertDummyChargingStationReturningID(dummyBuildingID, "station-test");
        const data = {
            stationID: dummyStationID,
            chargingConnector: {
                chargingTypeID: dummyChargingTypeID,
                serialNumber: 1
            }
        };

        await request.post('/api/v1/station/connector/post/new')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        expect(await helper.getNumberOfChargingStations()).toEqual(1);
        expect(await helper.getNumberOfChargingConnectors(dummyStationID)).toEqual(1);
    });

    test('delete a charging connector - success', async () => {
        await helper.clearStationsAndConnectors();
        const stationID = await helper.insertDummyChargingStationReturningID(dummyBuildingID, "station-name-delete");
        const connectorID = await helper.insertDummyChargingConnectorReturningID(stationID, dummyChargingTypeID, 1);

        expect(await helper.getNumberOfChargingConnectors(stationID)).toEqual(1);

        const data = {
            chargingConnectorID: connectorID
        };

        await request.delete('/api/v1/station/connector/delete/connector')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(await helper.getNumberOfChargingConnectors(stationID)).toEqual(0);
    });

    test('delete a charging connector - fail', async () => {
        await helper.clearStationsAndConnectors();
        const stationID = await helper.insertDummyChargingStationReturningID(dummyBuildingID, "station-name-delete");
        const connectorID = await helper.insertDummyChargingConnectorReturningID(stationID, dummyChargingTypeID, 1);

        expect(await helper.getNumberOfChargingConnectors(stationID)).toEqual(1);

        const data = {
            chargingConnectorID: connectorID+10000
        };

        const response = await request.delete('/api/v1/station/connector/delete/connector')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Failed to delete a connector");
    });

    test('edit a charging connector - serial number success', async () => {
        await helper.clearStationsAndConnectors();
        const stationID = await helper.insertDummyChargingStationReturningID(dummyBuildingID, "station-test-edit");
        const connectorID = await helper.insertDummyChargingConnectorReturningID(stationID, dummyChargingTypeID, 1);

        const [typeIDBefore, serialNumberBefore] = await helper.getChargingConnectorData(connectorID);

        expect(serialNumberBefore).toEqual(1);

        const data = {
            chargingConnectorID: connectorID,
            serialNumber: 5
        };

        await request.patch('/api/v1/station/connector/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [typeIDAfter, serialNumberAfter] = await helper.getChargingConnectorData(connectorID);

        expect(typeIDBefore).toEqual(typeIDAfter);
        expect(serialNumberAfter).toEqual(5);
    });

    test('edit a charging connector - serial number fail', async () => {
        await helper.clearStationsAndConnectors();
        const stationID = await helper.insertDummyChargingStationWithOneConnectorReturningID(dummyBuildingID, "station-test-edit", dummyChargingTypeID);
        const connectorID = await helper.insertDummyChargingConnectorReturningID(stationID, dummyChargingTypeID, 2);

        const [typeIDBefore, ] = await helper.getChargingConnectorData(connectorID);

        expect(typeIDBefore).toEqual(dummyChargingTypeID);

        const data = {
            chargingConnectorID: connectorID,
            serialNumber: 1
        };

        const response =  await request.patch('/api/v1/station/connector/patch/edit')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("");
    });

    test('edit a charging connector - charging type success', async () => {
        await helper.clearStationsAndConnectors();
        const stationID = await helper.insertDummyChargingStationReturningID(dummyBuildingID, "station-test-edit");
        const connectorID = await helper.insertDummyChargingConnectorReturningID(stationID, dummyChargingTypeID, 1);
        const otherChargingTypeID = await helper.insertDummyChargingTypeReturningID();

        const [typeIDBefore, serialNumberBefore] = await helper.getChargingConnectorData(connectorID);

        expect(typeIDBefore).toEqual(dummyChargingTypeID);

        const data = {
            chargingConnectorID: connectorID,
            chargingTypeID: otherChargingTypeID
        };

        await request.patch('/api/v1/station/connector/patch/edit')
            .send(data)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const [typeIDAfter, serialNumberAfter] = await helper.getChargingConnectorData(connectorID);

        expect(typeIDAfter).toEqual(otherChargingTypeID);
        expect(serialNumberAfter).toEqual(serialNumberBefore);
    });

    test('edit a charging connector - charging type fail', async () => {
        await helper.clearStationsAndConnectors();
        const stationID = await helper.insertDummyChargingStationReturningID(dummyBuildingID, "station-test-edit");
        const connectorID = await helper.insertDummyChargingConnectorReturningID(stationID, dummyChargingTypeID, 1);

        const [typeIDBefore, ] = await helper.getChargingConnectorData(connectorID);

        expect(typeIDBefore).toEqual(dummyChargingTypeID);

        const data = {
            chargingConnectorID: connectorID,
            chargingTypeID: dummyChargingTypeID+10000
        };

        const response =  await request.patch('/api/v1/station/connector/patch/edit')
            .send(data)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(response).toHaveProperty("body");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("violates foreign key constraint");
    });
});





