class BuildingResponse {
    buildingID: number;
    buildingName: string;
    buildingLocation: string;
    buildingLongitude: number;
    buildingLatitude: number;
}

class CompanyResponse {
    companyID: number;
    companyName: string;
}

class ChargingTypeResponse {
    chargingTypeID: number;
    chargingType: string;
}

class ChargingConnectorResponse {
    chargingConnectorID: number;
    chargingConnectorSerialNumber: number;
    chargingConnectorPowerOutput: number;
    chargingType: ChargingTypeResponse;
}

class ChargingStationResponse {
    chargingStationID: number;
    chargingStationName: string;
    chargingConnectors: ChargingConnectorResponse[];
    building: BuildingResponse | null;
    company: CompanyResponse | null;
}

export {
    BuildingResponse,
    CompanyResponse,
    ChargingTypeResponse,
    ChargingConnectorResponse,
    ChargingStationResponse,
};