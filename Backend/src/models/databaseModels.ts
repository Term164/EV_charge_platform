interface UserAccount {
    id: number,
    username: string,
    password_hash: string,
    email_account: string,
    validated: boolean,
    profile_picture?: Buffer,
    rfid?: number,
    company_id?: number,
    company_name?: string
}

interface building {
    id: number,
    building_name: string,
    building_location: string
}

interface company {
    id: number,
    company_name: string
}

interface buildingAdmin {
    account: UserAccount,
    building: building
}

interface companyAdmin {
    account: UserAccount,
    company: company
}

interface reservation {
    id: number;
    account_id: number;
    allocated_connector_id: number | null;
    desired_charging_type_id: number | null;
    creation_time: Date;
    charging_time: number;
    desired_from: Date;
    desired_to: Date;
    allocated_from: Date | null;
    allocated_to: Date | null;
    desired_building_id: number | null;
    position_in_queue: number | null;
}

export {
    UserAccount,
    building,
    company,
    buildingAdmin,
    companyAdmin,
    reservation
};