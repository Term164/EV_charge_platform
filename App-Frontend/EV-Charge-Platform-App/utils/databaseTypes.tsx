import { ChargingType } from "./types";

type APIResponse = {
    status: number,
    message: string,
    error: string | null,
    data: object | null
}

type LoginResponse = {data: {'sessionID': string} | null} & APIResponse;

type Profile = {
    company_id: number,
    email_account: string,
    id: number,
    password_hash: string,
    username: string,
    validated: boolean,
    rfid: string | undefined
}

type ProfileResponse = {
    data: Profile
} & APIResponse

type StationResponse = {
    data: {Result: Array<Station>}
} & APIResponse

type Connector = {
    chargingConnectorID: number,
    chargingConnectorSerialNumber: number,
    chargingConnectorPowerOutput: number,
    chargingType: {chargingTypeID: number, chargingType: ChargingType}

}

type Building = {
    buildingID: number,
    buildingName: string,
    buildingLocation: string,
    buildingLongitude: number,
    buildingLatitude: number,
    availability: number
}

type Station = {
    chargingStationID: number,
    chargingStationName: string,
    chargingConnectors: Array<Connector>,
    building: Building,
    copmpany: string
}

export {APIResponse, Profile, LoginResponse, ProfileResponse, StationResponse, Station, Building, Connector}