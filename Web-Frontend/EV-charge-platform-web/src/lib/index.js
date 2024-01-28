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
    console.log("BEFORE :accID",get(accountID),"accUsername",get(accountUsername),"roles",get(accountRole));
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
    console.log("DBG:accID",get(accountID),"accUsername",get(accountUsername),"roles",get(accountRole));
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
            'sessionID': await checkOnlySession(),
            "Content-Type": "application/json"
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
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log(res);
    if (!res.status || res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getRolesOfUser = async (userID) => {
    console.log("getting users role");
    const response = await fetch(
        serverUrl+'user/get/role?userID='+userID, {
        method: 'GET',
        headers: {
            'sessionID': await checkOnlySession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log("got",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);

    return res;
}

export const getUserProfile = async () => {
    console.log("getting profile data");
    const response = await fetch(
        serverUrl+'user/get/profile', {
        method: 'GET',
        headers: {
            'sessionID': await checkOnlySession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log("got",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompanyDataOfAdmin = async (userID) => {
    console.log("getting company data");
    const response = await fetch(
        serverUrl+'company/get/companyOfAdmin?userID='+userID, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log("got",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getAllCompanies = async () => {
    console.log("getting all company");
    const response = await fetch(
        serverUrl+'company/get/all', {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log("got",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const patchCompany = async (companyID, companyName) => {
    let data = {
        companyID: companyID,
        newCompanyName: companyName
    };

    console.log("patching company", data);
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
    console.log("deleting compnay", companyID);
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
    console.log("sending",data);
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
    console.log("getting company owned buildings");
    const response = await fetch(
        serverUrl+'building/get/companyOwned?companyID='+companyID, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log("got",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
}

export const getCompaniesInBuilding = async (buildingID) => {
    console.log("getting companies in building", buildingID);
    const response = await fetch(
        serverUrl+'building/get/assignedCompanies?buildingID='+buildingID, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log("got",res);
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
    console.log("updating rfid");
    const response = await fetch(
        serverUrl+'user/patch/editProfile', {
        method: 'PATCH',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json(); console.log("updated",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const assignUserToCompany = async (userID, companyID) => {
    let data = {
        userID: userID,
        companyID: companyID
    };
    console.log("assigning to company", data);
    const response = await fetch(
        serverUrl+'user/post/assignCompany', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json(); console.log("assigned",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const deleteAssignedCompanyFromBuilding = async (buildingID, companyID) => {
    console.log("deleting assigned company", buildingID, companyID);
    const response = await fetch(
        serverUrl+'building/delete/assignedCompany?buildingID='+buildingID+'&companyID='+companyID, {
        method: 'DELETE',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log("delete assigned",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const assignCompanyToBuilding = async (buildingID, companyID) => {
    let data = {
        buildingID: buildingID,
        companyID: companyID
    };
    console.log("assigning company to building", data);
    const response = await fetch(
        serverUrl+'building/post/assignCompany', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json(); console.log("assigned",res);
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
    console.log("assigning building access", data);
    const response = await fetch(
        serverUrl+'user/post/assignBuilding', {
        method: 'POST',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await response.json(); console.log("assigned",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const deleteAssignedBuildingAccess = async (userID, buildingID) => {
    console.log("deleting assigned building access");
    const response = await fetch(
        serverUrl+'user/delete/building_access?userID='+userID+'&buildingID='+buildingID, {
        method: 'DELETE',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log("deleted",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const getAssignedBuildingAccess = async (userID) => {
    console.log("getting assigned building access");
    const response = await fetch(
        serverUrl+'user/get/assignedBuildingAccesses?userID='+userID, {
        method: 'GET',
        headers: {
            'sessionID': await checkSession(),
            "Content-Type": "application/json"
        }
    });
    const res = await response.json(); console.log("assigned",res);
    if (res.status && res.status == 401)
        handleResponseIsError(res);
    
    return res;
};

export const getBuildingAdmins = async () => {
    console.log("getting badmins");
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
    console.log("getting all buildings");
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
    console.log("deleting buildng", buildingID);
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
    console.log("sending",data);
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
    console.log("patching buildng", data);
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
    console.log("getting cadmins");
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
    console.log("deleting cadmin",userID);
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
    console.log("assigning cadmin",data);
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
    console.log("assigning badmin",data);
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
    console.log("deleting badmin",userID, buildingID);
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

/* ======== Helper error functions ======== */
function handleResponseIsError (res) {
    console.log("handling", res);
    if (res.message == 'This sessionID has expired.')
        alert("Seja je potekla. Ponovno se prijavite.");
    goto('/login');
}




