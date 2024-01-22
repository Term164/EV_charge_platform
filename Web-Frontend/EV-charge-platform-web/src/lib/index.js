// Middleware for all API calls

import { goto } from '$app/navigation';
import { accountRole } from '../store';

const serverUrl = 'http://192.168.1.202:4200/api/v1/';

function setSession (session) {
    document.cookie = 'sessionID='+session+'; sameSite=Strict';
}

function checkSession () {
    if (!document.cookie) {
        // TODO show him a modal or something
        alert("Seja je potekla ali pa ne obstaja. Ponovno se prijavite.");
        goto('/login');
    }

    if (!accountRole || accountRole == '')
        getRoleOfUser();

    return document.cookie.split('; ')[0].split('=')[1];
}

function deleteCookies () {
    document.cookie.replace(/(?<=^|;).+?(?=\=|;|$)/g, name => location.hostname.split('.').reverse().reduce(domain => (domain=domain.replace(/^\.?[^.]+/, ''),document.cookie=`${name}=;max-age=0;path=/;domain=${domain}`,domain), location.hostname));
}

export const logout = () => {
    deleteCookies();
    goto('/login');
};

export const login = async (username, password) => {
    let data = {
        username: username,
        password: password
    };

    const response = await fetch(
        serverUrl+'auth/login', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.status == 200)
        setSession(result.data.sessionID);
    
    return result.status;
}

export const register = async (username, email, password) => {
    let data = {
        username: username,
        email_account: email,
        password: password
    };
    console.log("sending", data);
    const response = await fetch(
        serverUrl+'auth/register/step1', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    
    return await response.json();
}

export const ping = async () => {
    console.log("pinging..");
    const response = await fetch(
        serverUrl+'dev/ping', {
        method: 'GET',
        headers: {
            'sessionID': checkSession()
        }
    });
    const res = await response.json(); console.log(res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getAllUsers = async () => {
    console.log("getting all users");
    const response = await fetch(
        serverUrl+'user/get/users', {
        method: 'GET',
        headers: {
            'sessionID': checkSession()
        }
    });
    const res = await response.json(); console.log(res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getRoleOfUser = async () => {
    console.log("getting users role");
    const response = await fetch(
        serverUrl+'user/get/role', {
        method: 'GET',
        headers: {
            'sessionID': checkSession()
        }
    });
    const res = await response.json(); console.log(res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    accountRole.set(res.data.Role);

    return res;
}

export const getUserProfile = async () => {
    console.log("getting profile data");
    const response = await fetch(
        serverUrl+'user/get/profile', {
        method: 'GET',
        headers: {
            'sessionID': checkSession()
        }
    });
    const res = await response.json(); console.log(res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompanyData = async () => {
    console.log("getting company data");
    const response = await fetch(
        serverUrl+'company/get/companyOfAdmin', {
        method: 'GET',
        headers: {
            'sessionID': checkSession()
        }
    });
    const res = await response.json(); console.log(res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompanyOwnedBuildings = async (companyID) => {
    console.log("getting company owned buildings");
    const response = await fetch(
        serverUrl+'building/get/companyOwned?companyID='+companyID, {
        method: 'GET',
        headers: {
            'sessionID': checkSession()
        }
    });
    const res = await response.json(); console.log(res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompanyUsers = async (companyID) => {
    console.log("getting company users");
    const response = await fetch(
        serverUrl+'user/get/companyUsers?companyID='+companyID, {
        method: 'GET',
        headers: {
            'sessionID': checkSession()
        }
    });
    const res = await response.json(); console.log(res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const updateRFID = async (userID, rfid) => {
    let data = {
        userID: userID,
        rfid: rfid
    };
    console.log("updating rfid");
    const response = await fetch(
        serverUrl+'user/patch/editProfile', {
        method: 'PATCH',
        headers: {
            'sessionID': checkSession()
        },
        body: JSON.stringify(data)
    });
    const res = await response.json(); console.log(res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const assignCompany = async (userID, companyID) => {
    let data = {
        userID: userID,
        companyID: companyID
    };
    console.log("assigning to company", data);
    const response = await fetch(
        serverUrl+'user/post/assignCompany', {
        method: 'POST',
        headers: {
            'sessionID': checkSession()
        },
        body: JSON.stringify(data)
    });
    const res = await response.json(); console.log(res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};


function handleResponseIsError (res) {
    console.log("handling", res);
    if (res.message == 'This sessionID has expired.') {
        alert("Seja je potekla. Ponovno se prijavite.");
        goto('/login');
    } else if (res.message == 'No session with this ID exists.') {
        alert("Seja ne obstaja. Prijavite se.");
        goto('/login');
    }

}




