import { writable } from "svelte/store";

export const accountRole = writable(null);
export const accountID = writable(-1);
export const accountUsername = writable('');

export const accountCompanyID = writable(-1);
export const accountCompanyName = writable('');

export const myBuildingIDs = writable([]);
