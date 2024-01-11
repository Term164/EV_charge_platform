import Type2SVG from "../assets/connector-icons/ev-plug-type2.svg";
import CHAdeMOSVG from "../assets/connector-icons/ev-plug-chademo.svg";
import TeslaSVG from "../assets/connector-icons/ev-plug-tesla.svg";
import CSSSVG from "../assets/connector-icons/ev-plug-ccs2.svg";
import { Building, ChargingType, Connector } from "../utils/types";
import { DBConnector, Station } from "./databaseTypes";

export function getConnectorIcon(connectorType: ChargingType, colorScheme: string) {
    switch(connectorType) {
        case ChargingType.TYPE2: 
            return <Type2SVG width={35} height={35} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'} />
        case ChargingType.TYPE1: 
            return <Type2SVG width={30} height={30} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'} />
        case ChargingType.CHAdeMO: 
            return <CHAdeMOSVG width={25} height={25} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'}/>
        case ChargingType.CCS:
            return <CSSSVG width={30} height={30} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'}/>
        case ChargingType.TESLASUC:
            return <TeslaSVG width={25} height={25} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'}/>
    }
}

export function getChargingTypeID(type: ChargingType) {
    switch(type) {
        case ChargingType.TYPE1: 
            return 1;
        case ChargingType.TYPE2:
            return 2;
        case ChargingType.CHAdeMO: 
            return 3;
        case ChargingType.CCS:
            return 4;
        case ChargingType.TESLASUC:
            return 5;
    }
}

export function combineDateAndTime (date: Date, time: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
}

const ChargingTypeLabelValueMap = new Map<string, string>([
    ['TYPE1', 'Type 1'],
    ['TYPE2', 'Type 2'],
    ['CHAdeMO', 'ChAdeMO'],
    ['CSS', 'CSS'],
    ['TESLASUC', 'TESLA']
]);

export function getLabelFromChargingTypeValue(value: string) {
    return ChargingTypeLabelValueMap.get(value) as string;
}

export function getTimeFromDate(date: Date) {
    date = new Date(date);
    return `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)} `
}

export function parseStations(stations: Array<Station>, selectedChargingTypes: Array<string>) {
    const buildings: Map<number, Building> = new Map<number, Building>();

    stations.forEach(station => {
        if (buildings.has(station.building.buildingID)) {
            const building = buildings.get(station.building.buildingID);
            const connectors = parseStationConnectors(station.chargingConnectors, selectedChargingTypes);
            if (building?.Connectors != null) {
                building.Connectors = mergeConnectors(building.Connectors as Array<Connector>, connectors);
                building.stations += 1;
            }
            buildings.set(station.building.buildingID, building as Building);
        } else {
            const connectors = mergeConnectors(parseStationConnectors(station.chargingConnectors, selectedChargingTypes), []);
            if (connectors.length < 1) return; // If there is no connectors dont creat the building

            const building: Building = {
                id: station.building.buildingID,
                coordinate: {latitude: station.building.buildingLatitude, longitude: station.building.buildingLongitude},
                address: station.building.buildingLocation,
                name: station.building.buildingName,
                stations: 1,
                availability: Math.round(Math.random()*100), //TODO: fix this lol
                Connectors: connectors
            }

            buildings.set(station.building.buildingID, building);
        }
        station.building.buildingID
    });

    return Array.from(buildings.values());
}

function parseStationConnectors(connectors: Array<DBConnector>, selectedChargingTypes: Array<string>) {
    const newConnectors: Array<Connector> = [];

    connectors.forEach(connector => {
        if (selectedChargingTypes.length != 0) {
            if (!selectedChargingTypes.includes(connector.chargingType.chargingType.toString())) return;
        }
        
        const newConnector: Connector = {
            chargingType: connector.chargingType.chargingType,
            numberOfConnectors: 1,
            watts: connector.chargingConnectorPowerOutput
        }
        newConnectors.push(newConnector);
    });

    return newConnectors;
}

function compareConnectors(con1: Connector, con2: Connector) {
    return con2.watts - con1.watts;
}

function mergeConnectors(connectorsA: Array<Connector>, connectorsB: Array<Connector>) {
    const connectorMap: Map<string,Connector> = new Map<string, Connector>();
    connectorsA.forEach(connector => {
        const keyTuple: string = [connector.watts, connector.chargingType].join();
        if (connectorMap.has(keyTuple)) {
            const conn = connectorMap.get(keyTuple);
            if (conn != null) {
                conn.numberOfConnectors += connector.numberOfConnectors;
                connectorMap.set(keyTuple, conn);
            }
        } else {
            connectorMap.set([connector.watts, connector.chargingType].join(), connector);
        }
    })

    connectorsB.forEach(connector => {
        const keyTuple: string = [connector.watts, connector.chargingType].join();
        if (connectorMap.has(keyTuple)) {
            const conn = connectorMap.get(keyTuple);
            if (conn != null) {
                conn.numberOfConnectors += connector.numberOfConnectors;
                connectorMap.set(keyTuple, conn);
            }
        } else {
            connectorMap.set([connector.watts, connector.chargingType].join(), connector);
        }
    })

    return Array.from(connectorMap.values()).sort(compareConnectors)
}
