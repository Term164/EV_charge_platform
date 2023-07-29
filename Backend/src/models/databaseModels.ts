interface UserAccount {
    id: number,
    username: string,
    password_hash: string,
    email_account: string,
    validated: boolean,
    profile_picture?: string,
    rfid?: number,
    company_id?: number
}

export {
    UserAccount
};