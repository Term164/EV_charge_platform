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

export {
    UserAccount,
    building,
    company,
    buildingAdmin,
    companyAdmin
};