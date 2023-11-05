class BuildingResponse {
    buildingID: number;
    buildingName: string;
    buildingLocation: string;
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
}