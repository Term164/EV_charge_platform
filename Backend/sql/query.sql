-- QUERY STATEMENTS
-- 
-- The list of SQL commands is separated into some parts, which resemble the REST API group endpoints.
-- 
-- The statements are built like this:
/*

-- DESCRIPTION
-- ENDPOINT
-- [ ROLES ]
-- { PARAMETERS }
QUERY_STATEMENT;

*/
-- DESCRIPTION:
-- Loose description of what the statement does. Some other descriptions are in the Documentaion file.
-- 
-- ENDPOINT:
-- Which API endpoint is this statement being called from.
-- 
-- ROLES:
-- In square brackets [] are the ROLES, which have acces to the query. Question mark ? means that we're not 100% sure, it will be clear once we do some usecases or something...
-- Let's presume that PLATFORM ADMIN has acces to everything, so for the sake of simplicity the platform_admin role will not be included in the ROLES.
-- => If a query statement doesn't have any ROLES listed, it means it's only for the Platform Admins!
-- 
-- PARAMETERS:
-- Curly brackets {} define PARAMETERS, since some statements will need them (usually IDs, or something)
-- If no PARAMETERS are listed, query doesn't need parameters
-- 
-- NOTE:
-- One table here has an unusual name because of the hyphen - , that table being Building-Company.
-- In the SQL editor, the hyphen is not allowed, so I was forced to do quotation marks "" .
-- Be wary when making server code, to either properly escape said quotations -> \"Building-Company\"
-- Or maybe use single quotation marks -> "SELECT FROM 'Building-Company' WHERE..."
-- Or something clever.
-- Just a heads up to pay attention when dealing with this table!
-- 
-- V 1.0


--=============================== AUTH ===============================

-- login, this returns the password hash and salt, if the unique username exists
-- /api/v1/auth/login
-- { username }
SELECT password_hash, password_salt FROM Accounts
WHERE username LIKE {username};


-- register (step 1), adds an accounts, unvalidated
-- /api/v1/auth/register/step1
-- { username, password_hash, email_account }
INSERT INTO Accounts ("username","password_hash", "email_account")
VALUES ({username}, {password_hash}, {email_account});


-- register step 2, validates an account
-- /api/v1/auth/register/step2/:id/:token
-- { username }
UPDATE Accounts
SET validated = TRUE
WHERE username LIKE {username};


INSERT INTO Sessions ("account_id", "session_id", "expiration_time")
VALUES ({account_id}, {session_id}, {expiration_time});

-- logout, sessionID gets deleted
-- /api/v1/auth/logout
-- { session_id }
DELETE FROM Sessions
WHERE session_secret LIKE {session_id};


--=== AUTH SUPPORT CALL ===

-- username uniqueness, check if the username exists
-- {username}
SELECT id FROM Accounts
WHERE username LIKE {username};


SELECT id FROM Accounts
WHERE email_account LIKE {email_account}

-- Insert validation secret token into database
-- { account_id, registration_secret, expiration_time }

INSERT INTO Registration_secrets ("account_id", "registration_secret", "expiration_time")
VALUES ({account_id}, {registration_secret}, {expiration_time});

-- session confirmation, confirm that the given sessionID exists and didn't expire
-- { session_id }
SELECT * FROM Sessions
WHERE session_secret LIKE {session_id} AND NOW() < expiration_time;

-- session refresh, when a call succeeds, refresh the session
-- { session_id, refresh_time }
-- -> refresh_time is a number in minutes
UPDATE Session
SET expiration_time = expiration_time + interval '{refresh_time} minutes'
WHERE session_secret LIKE {session_id};


--=============================== USER ===============================

-- All building admins
-- /api/v1/user/get/buildingAdmins
SELECT ba.id, ba.account_id, ba.building_id, username, password_hash, password_salt, email_account, profile_picture
FROM Building_admins ba JOIN Accounts a ON a.id = ba.account_id;


-- Building admin that has control of a selected building
-- /api/v1/user/get/assignedBadmins (buildingID)
-- [ Company_admin ? ]
-- { selected_building_id }
SELECT ba.id, ba.account_id, username, password_hash, password_salt, email_account, profile_picture
FROM Building_admins ba JOIN Accounts a ON a.id = ba.account_id
WHERE ba.building_id = {selected_building_id};


-- All company admins
-- /api/v1/user/get/companyAdmins
-- [ Building_admin ]
SELECT ca.id, ca.account_id, ca.company_id, username, password_hash, password_salt, email_account, profile_picture
FROM Company_admins ca JOIN Accounts a ON a.id = ca.account_id;


-- Company admin that has control of a selected company
-- /api/v1/user/get/assignedCadmins (companyID)
-- [ Building_admin ]
-- { selected_company_id }
SELECT ca.id, ca.account_id, username, password_hash, password_salt, email_account, profile_picture
FROM Company_admins ca JOIN Accounts a ON a.id = ca.account_id
WHERE ca.company_id = {selected_company_id};


-- Remove a building admin
-- /api/v1/user/delete/badmin (userID)
-- { account_id }
DELETE FROM Building_admins
WHERE account_id = {account_id};


-- Remove a company admin
-- /api/v1/user/delete/cadmin (userID)
-- { account_id }
DELETE FROM Company_admins
WHERE account_id = {account_id};


-- Assign a person to be a building admin
-- /api/v1/user/post/assignBadmin (userID, buildingID)
-- { account_id, building_id }
INSERT INTO Building_admins (account_id, building_id)
VALUES ({account_id}, {building_id});


-- Assign a person to be a company admin
-- /api/v1/user/post/assignCadmin (userID, companyID)
-- { account_id, company_id }
INSERT INTO Company_admins (account_id, company_id)
VALUES ({account_id}, {company_id});


-- Make an employee and assign him a company he works for
-- Optionally, give him an rfid card, or null
-- /api/v1/user/post/assignCompany (userID, companyID)
-- { account_id, company_id }
INSERT INTO Company_admins (account_id, company_id)
VALUES ({account_id}, {company_id});


-- Add an employee to a specific building (company owned)
-- /api/v1/user/post/assignBuilding (userID, buildingID)
-- { accout_id, building_id, company_admin_id, expiration_date? }
-- Company_admin_id refers to the admin which "creates" the guest. Can be tracked down for company name
INSERT INTO Building_accesses (account_id, building_id, company_admin_id)
VALUES (
    {account_id}, {building_id}, {company_admin_id}, {expiration_date}
);


-- TODO:
-- Removes an employee from a building, or from a company
-- /api/v1/user/delete/employee (userID, companyID?, buildingID?) complex
-- If a buildingID is specified, removes an employee from only that building




-- Remove an account. DISCLAIMER: Deleting a company/building/platform admin should happen first!
-- Not an endpoint
-- { account_id }
DELETE FROM Accounts
WHERE id = {account_id};


-- Edit user profile
-- /api/v1/user/patch/editProfile (userID)
-- { account_id, ... }
UPDATE Accounts
SET {attr1_name} = {attr1_value}    , {attr2_name} = {attr2_value}
WHERE id = {account_id};


-- What are the endpoints for these??

-- All accounts
SELECT *
FROM Accounts;

-- All platform admins
SELECT pa.id, pa.account_id, username, password_hash, password_salt, email_account, profile_picture
FROM Platform_admins pa JOIN Accounts a ON a.id = pa.account_id;

-- All consumers
SELECT *
FROM Consumers c JOIN Accounts a ON c.account_id = a.id ;

-- All guests
SELECT *
FROM Consumers c JOIN Accounts a ON c.account_id = a.id 
WHERE expiration_date IS NOT NULL;

--=============================== COMPANY ===============================

-- All companies
-- /api/v1/company/get/all
-- [ Building_admin, Company_admin ? ]
SELECT * FROM Companies;


-- Create a new company
-- /api/v1/company/post/new
-- { name }
INSERT INTO Companies ("company_name")
VALUES ({name});


-- Delete a company
-- /api/v1/company/delete/company (companyID)
-- { company_id }
DELETE FROM Companies
WHERE id = {company_id};


-- Edit company info
-- /api/v1/company/patch/edit (companyID)
-- {company_id, new_company_name }
-- Disclaimer: 'Companies' table only has 1 attribute (company_name), but this can change anytime
UPDATE Companies
SET company_name = {new_company_name}
WHERE id = {company_id};


-- What are the endpoints for these??

-- Company that is controlled by a selected company_admin
-- { selected_company_admin_id }
SELECT c.id, company_name
FROM Companies c JOIN Company_admins ca ON c.id = ca.company_id
WHERE ca.id = {selected_company_admin_id};


--=============================== BUILDING ===============================

-- All buildings
-- /api/v1/building/get/all
-- [ Building_admin ?, Company_admin ]
SELECT * FROM Buildings;


-- All buildings that are "used" by a selected company
-- /api/v1/building/get/companyOwned (companyID)
-- [ Company_admin ]
-- { selected_company_id }
SELECT b.id building_id, building_name, building_location
FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id JOIN Companies c ON c.id = bc.company_id
WHERE c.id = {selected_company_id};


-- All companies that "live" in a selected building
-- /api/v1/building/get/assignedCompanies (buildingID)
-- [ Building_admin ]
-- { selected_building_id }
SELECT c.id company_id, company_name
FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id JOIN Companies c ON c.id = bc.company_id
WHERE b.id= {selected_building_id};


-- Create a new building
-- /api/v1/building/post/new
-- { name, location }
INSERT INTO Buildings ("building_name", "building_location")
VALUES ({name}, {location});


-- Delete a building
-- /api/v1/building/delete/building
-- { building_id }
DELETE FROM Buildings
WHERE id = {building_id};


-- Assign a company to "work" in a building
-- /api/v1/building/post/assignCompany (companyID, buildingID)
-- { company_id, building_id }
INSERT INTO "Building-Company" ("company_id", "building_id")
VALUES ({company_id}, {building_id});



-- Edit building info
-- /api/v1/building/patch/edit (buildingID)
-- { building_id, ... }
UPDATE Buildings
SET {attr1_name} = {attr1_value}    , {attr2_name} = {attr2_value}
WHERE id = {building_id};


-- What are the endpoints for these??

-- Building that is controlled by a selected building_admin
-- { selected_building_admin_id }
SELECT building_id, building_name, building_location
FROM Buildings b JOIN Building_admins ba ON b.id = ba.building_id
WHERE ba.id = {selected_building_admin_id};


--=============================== STATION ===============================


-- All charging stations
-- /api/v1/station/get/all (buildingID?) -> WHEN buildingID IS NULL
SELECT cs.id, name, ct.id type_id, type, b.id building_id, building_name, building_location
FROM Charging_stations cs JOIN Charging_types ct ON cs.charging_type_id = ct.id JOIN Buildings b ON cs.building_id = b.id;

-- All charging stations that belong to a selected building
-- /api/v1/station/get/all (buildingID?) -> WHEN buildingID IS NOT NULL
-- [ Building_admin ]
-- { selected_building_id }
SELECT cs.id, name, ct.id type_id, type
FROM Charging_stations cs JOIN Charging_types ct ON cs.charging_type_id = ct.id JOIN Buildings b ON cs.building_id = b.id
WHERE b.id = {selected_building_id};


-- Make a new charging station
-- /api/v1/station/post/new (buildingID)
-- { charging_type_id?, building_id, name }
INSERT INTO Charging_stations ("charging_type_id", "building_id", "name")
VALUES ({charging_type_id}, {building_id}, {name});


-- Remove a charging station
-- /api/v1/station/delete/station (stationID)
-- { station_id }
DELETE FROM Charging_stations
WHERE id = {station_id};


-- Reserve a station to a specific company, or clear the reservation if null
-- /api/v1/station/post/assignCompany (stationID, companyID)
-- { station_id, company_id? }
UPDATE Charging_stations
SET company_id = {company_id}
WHERE id = {station_id};



-- TODO:
-- /api/v1/station/patch/edit (stationID)
-- /api/v1/station/get/allAvailable (userID) complex


-- What are the endpoints for these??

--=============================== RESERVATION ===============================

-- All available charging types for some selected building
-- /api/v1/reservation/get/stationType (buildingID)
-- [ Building_admin, Company_admin ? ]
-- { selected_building_id }
SELECT DISTINCT ct.type
FROM charging_types ct JOIN charging_stations cs ON cs.charging_type_id = ct.id
WHERE building_id = {selected_building_id};


-- Gets all reservations for a user
-- /api/v1/reservation/get/all (userID)
-- { account_id }
SELECT *
FROM Reservations
WHERE account_id = {account_id};


-- Cancel a reservation, some stuff happens here, like notification for others...in backend
-- /api/v1/reservation/delete/cancel (reservationID)
-- { reservation_id }
DELETE FROM Reservatinos
WHERE id = {reservation_id};



-- TODO:
-- /api/v1/reservation/patch/edit (reservationID)
-- /api/v1/reservation/post/new (…)

-- What are the endpoints for these??



--======= RANDOM CALLS, NOT TO BE USED !? =======

-- All "connected" buildings and companies. Not to be used, really
SELECT b.id building_id, building_name, building_location, c.id company_id, company_name
FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id JOIN Companies c ON c.id = bc.company_id;


