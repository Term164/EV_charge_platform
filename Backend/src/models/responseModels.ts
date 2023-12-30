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

class CreatedReservationInfo {
    userID: number;
    allocatedConnectorID: number | null;
    allocatedFrom: Date | null;
    allocatedTo: Date | null;
    chargingTime: number | null;
    positionInQueue: number | null;
}

export {
    BuildingResponse,
    CompanyResponse,
    ChargingTypeResponse,
    ChargingConnectorResponse,
    ChargingStationResponse,
    CreatedReservationInfo,
};