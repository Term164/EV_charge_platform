// Middleware for all API calls

import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { accountID, accountRole, accountUsername } from '../store';

const serverUrl = 'http://ec2-13-49-225-227.eu-north-1.compute.amazonaws.com:3000/api/v1/';

function setSession (session) {
    document.cookie = 'sessionID='+session+'; SameSite=Strict; Secure';
}

async function checkSession () {
    if (!document.cookie) {
        // TODO show him a modal or something about session
        goto('/login');
    }

    if (get(accountRole) == null || get(accountID) == -1)
        await setRoleAndUserProfile();

    return document.cookie.split('; ')[0].split('=')[1];
}

async function checkOnlySession () {
    if (!document.cookie) {
        // TODO show him a modal or something about session
        goto('/login');
    }

    return document.cookie.split('; ')[0].split('=')[1];
}

export const setRoleAndUserProfile = async () => {
    if (get(accountRole) != null) return true;
    await getUserProfile().then( async x => {
        if (x.status == 200){
            accountID.set(x.data.id);
            accountUsername.set(x.data.username);
            await getRolesOfUser(get(accountID)).then(async y => {
                if (y.status == 200)
                    accountRole.set(y.data.Roles ?? []);
                else return false;
            });
        } else return false;
    });
    return true;
}

function deleteCookies () {
    document.cookie.replace(/(?<=^|;).+?(?=\=|;|$)/g, name => location.hostname.split('.').reverse().reduce(domain => (domain=domain.replace(/^\.?[^.]+/, ''),document.cookie=`${name}=;max-age=0;path=/;domain=${domain}`,domain), location.hostname));
}

export const logout = () => {
    deleteCookies();
    goto('/login');
};

/*=========== API CALLS ===========*/

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
    const response = await fetch(
        serverUrl+'dev/ping', {
        method: 'GET',
        headers: {
            'sessionID': await checkOnlySession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getAllUsers = async () => {
    const response = await fetch(
        serverUrl+'user/get/users', {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (!res.status || res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getRolesOfUser = async (userID) => {
    const response = await fetch(
        serverUrl+'user/get/role?userID='+userID, {
        method: 'GET',
        headers: {
            'sessionID': await checkOnlySession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);

    return res;
}

export const getUserProfile = async () => {
    const response = await fetch(
        serverUrl+'user/get/profile', {
        method: 'GET',
        headers: {
            'sessionID': await checkOnlySession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompanyDataOfAdmin = async (userID) => {
    const response = await fetch(
        serverUrl+'company/get/companyOfAdmin?userID='+userID, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getAllCompanies = async () => {
    const response = await fetch(
        serverUrl+'company/get/all', {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const patchCompany = async (companyID, companyName) => {
    let data = {
        companyID: companyID,
        newCompanyName: companyName
    };

    const response = await fetch(
        serverUrl+'company/patch/edit', {
        method: 'PATCH',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const deleteCompany = async (companyID) => {
    const response = await fetch(
        serverUrl+'company/delete/company?companyID='+companyID, {
        method: 'DELETE',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const createNewCompany = async (companyName) => {
    let data = {
        companyName: companyName
    };
    const response = await fetch(
        serverUrl+'company/post/new', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompanyOwnedBuildings = async (companyID) => {
    const response = await fetch(
        serverUrl+'building/get/companyOwned?companyID='+companyID, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompaniesInBuilding = async (buildingID) => {
    const response = await fetch(
        serverUrl+'building/get/assignedCompanies?buildingID='+buildingID, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompanyUsers = async (companyID) => {
    const response = await fetch(
        serverUrl+'user/get/companyUsers?companyID='+companyID, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const updateRFID = async (userID, rfid) => {
    let data = {
        userID: userID,
        rfid: rfid
    };
    const response = await fetch(
        serverUrl+'user/patch/editProfile', {
        method: 'PATCH',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const assignUserToCompany = async (userID, companyID) => {
    let data = {
        userID: userID,
        companyID: companyID
    };
    const response = await fetch(
        serverUrl+'user/post/assignCompany', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const deleteAssignedCompanyFromBuilding = async (buildingID, companyID) => {
    const response = await fetch(
        serverUrl+'building/delete/assignedCompany?buildingID='+buildingID+'&companyID='+companyID, {
        method: 'DELETE',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const assignCompanyToBuilding = async (buildingID, companyID) => {
    let data = {
        buildingID: buildingID,
        companyID: companyID
    };
    const response = await fetch(
        serverUrl+'building/post/assignCompany', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};


export const assignBuildingAccess = async (userID, buildingID, companyAdminID) => {
    let data = {
        userID: userID,
        buildingID: buildingID,
        companyAdminID: companyAdminID
    };
    const response = await fetch(
        serverUrl+'user/post/assignBuilding', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const deleteAssignedBuildingAccess = async (userID, buildingID) => {
    const response = await fetch(
        serverUrl+'user/delete/building_access?userID='+userID+'&buildingID='+buildingID, {
        method: 'DELETE',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const getAssignedBuildingAccess = async (userID) => {
    const response = await fetch(
        serverUrl+'user/get/assignedBuildingAccesses?userID='+userID, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const getBuildingAdmins = async () => {
    const response = await fetch(
        serverUrl+'user/get/buildingAdmins', {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getAllBuildings = async () => {
    const response = await fetch(
        serverUrl+'building/get/all', {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const deleteBuilding = async (buildingID) => {
    const response = await fetch(
        serverUrl+'building/delete/building?buildingID='+buildingID, {
        method: 'DELETE',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const createNewBuilding = async (buildingName, buildingLocation, buildingLongitude, buildingLatitude) => {
    let data = {
        buildingName: buildingName,
        buildingLocation: buildingLocation,
        buildingLongitude: buildingLongitude,
        buildingLatitude: buildingLatitude
    };
    const response = await fetch(
        serverUrl+'building/post/new', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const patchBuilding = async (buildingID, buildingName, buildingLocation) => {
    let data = {buildingID: buildingID};
    if (buildingName != null)
        data.newBuildingName = buildingName;
    if (buildingLocation != null)
        data.newBuildingLocation = buildingLocation;
    const response = await fetch(
        serverUrl+'building/patch/edit', {
        method: 'PATCH',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompanyAdmins = async () => {
    const response = await fetch(
        serverUrl+'user/get/companyAdmins', {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const deleteCompanyAdmin = async (userID) => {
    const response = await fetch(
        serverUrl+'user/delete/cadmin?userID='+userID, {
        method: 'DELETE',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const assignCompanyAdmin = async (userID, companyID) => {
    let data = {
        userID: userID,
        companyID: companyID
    };
    const response = await fetch(
        serverUrl+'user/post/assignCadmin', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const assignBuildingAdmin = async (userID, buildingID) => {
    let data = {
        userID: userID,
        buildingID: buildingID
    };
    const response = await fetch(
        serverUrl+'user/post/assignBadmin', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const deleteBuildingAdmin = async (userID, buildingID) => {
    const response = await fetch(
        serverUrl+'user/delete/badmin?userID='+userID+'&buildingID='+buildingID, {
        method: 'DELETE',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getAllStations = async (buildingID) => {
    let postfix = '';
    if (buildingID != null);
        postfix = '?buildingID='+buildingID;
    const response = await fetch(
        serverUrl+'station/get/all'+postfix, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getAllChargingTypes = async () => {
    const response = await fetch(
        serverUrl+'station/type/get/all', {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const createNewStation = async (obj) => {
    const response = await fetch(
        serverUrl+'station/post/new', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const deleteStation = async (stationID) => {
    const response = await fetch(
        serverUrl+'station/delete/station?stationID='+stationID, {
        method: 'DELETE',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json();
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}


/* ======== Helper error functions ======== */
function handleResponseIsError (res) {
    console.log("handling error", res);
    if (res.message == 'This sessionID has expired.')
        alert("Seja je potekla. Ponovno se prijavite.");
    goto('/login');
}




