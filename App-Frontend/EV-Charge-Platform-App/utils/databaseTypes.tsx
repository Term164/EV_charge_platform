import { ChargingType } from "./types";

type APIResponse = {
    status: number,
    message: string,
    error: string | null,
    data: object | null
}

type forgotPasswordResponse = {
    data: {account_id: number} 
} & APIResponse;

type LoginResponse = {data: {'sessionID': string} | null} & APIResponse;

type Profile = {
    company_id: number,
    company_name: string,
    email_account: string,
    id: number,
    password_hash: string,
    username: string,
    validated: boolean,
    rfid?: string,
    profile_picture?: Buffer
}

type ProfileResponse = {
    data: Profile
} & APIResponse

type StationResponse = {
    data: {Result: Array<Station>}
} & APIResponse

type DBConnector = {
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
    chargingConnectors: Array<DBConnector>,
    building: Building,
    copmpany: string
}

export {APIResponse, Profile, LoginResponse, ProfileResponse, StationResponse, Station, Building, DBConnector, forgotPasswordResponse}