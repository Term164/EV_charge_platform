import { writable } from 'svelte/store';

export const store = writable(null);

let sessions = []

export const login = async ( username, password ) => {
    let data = {
        username: username,
        password: password
    };
    console.log("sending",JSON.stringify(data));

    const response = await fetch(
        'http://192.168.1.202:4200/api/v1/auth/login',
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        }
    );

    console.log("DONE", response.status);
    console.log(await response.json());

    return await response.json();
}