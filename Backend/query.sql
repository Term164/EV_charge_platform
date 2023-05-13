-- QUERY STATEMENTS
-- 
-- This file is separated into 3 parts, which loosely resemble the REST API calls.
-- Technically this means that GET requests are all SELECT statements, POST requests are INSERTs, and PUT requests are UPDATEs
-- 
-- The statements are built like this:
/*

-- DESCRIPTION
-- [ ROLES ]
-- { PARAMETERS }
QUERY_STATEMENT;

*/
-- ROLES:
-- In square brackets [] are the ROLES, which have acces to the query. Question mark ? means that i'm not 100% sure, it will be clear once we do some usecases or something...
-- Let's presume that PLATFORM ADMIN has acces to everything, so for the sakes of simplicity the platform_admin role will not be included in the ROLES.
-- => If a query statement doesn't have any ROLES listed, it means it's only for the Platform Admins!
-- 
-- PARAMETERS:
-- Curly brackets {} define PARAMETERS, since some statements will need them (usually IDs, or something)
-- If no PARAMETERS are listed...............waitforit........it means the query doesn't need parameters
-- 
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


/*

NEKI MANJKA!!!!! Kako veš če polnilnica pripada določenemu podjetju.....
V ER diagramu v tabeli "Charging_stations" bi moralo tudi to biti zapisano!!!!

*/




--======= GET =======

-- All accounts
SELECT *
FROM Accounts;

-- All platform admins
SELECT pa.id, pa.account_id, username, password_hash, password_salt, email_account, profile_picture
FROM Platform_admins pa JOIN Accounts a ON a.id = pa.account_id;

-- All building admins
SELECT ba.id, ba.account_id, ba.building_id, username, password_hash, password_salt, email_account, profile_picture
FROM Building_admins ba JOIN Accounts a ON a.id = ba.account_id;

-- Building admin that has control of a selected building
-- [ Company_admin ? ]
-- { selected_building_id }
SELECT ba.id, ba.account_id, username, password_hash, password_salt, email_account, profile_picture
FROM Building_admins ba JOIN Accounts a ON a.id = ba.account_id
WHERE ba.building_id = {selected_building_id};

-- All company admins
-- [ Building_admin ]
SELECT ca.id, ca.account_id, ca.company_id, username, password_hash, password_salt, email_account, profile_picture
FROM Company_admins ca JOIN Accounts a ON a.id = ca.account_id;

-- Company admin that has control of a selected company
-- [ Building_admin ]
-- { selected_company_id }
SELECT ca.id, ca.account_id, username, password_hash, password_salt, email_account, profile_picture
FROM Company_admins ca JOIN Accounts a ON a.id = ca.account_id
WHERE ca.company_id = {selected_company_id};

-- All buildings
-- [ Building_admin ?, Company_admin ]
SELECT * FROM Buildings;

-- Building that is controlled by a selected building_admin
-- { selected_building_admin_id }
SELECT building_id, building_name, building_location
FROM Buildings b JOIN Building_admins ba ON b.id = ba.building_id
WHERE ba.id = {selected_building_admin_id};

-- All companies
-- [ Building_admin, Company_admin ? ]
SELECT * FROM Companies;

-- Company that is controlled by a selected company_admin
-- { selected_company_admin_id }
SELECT c.id, company_name
FROM Companies c JOIN Company_admins ca ON c.id = ca.company_id
WHERE ca.id = {selected_company_admin_id};

-- All "connected" buildings and companies. Not to be used, really
SELECT b.id building_id, building_name, building_location, c.id company_id, company_name
FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id JOIN Companies c ON c.id = bc.company_id;

-- All companies that "live" in a selected building
-- [ Building_admin ]
-- { selected_building_id }
SELECT c.id company_id, company_name
FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id JOIN Companies c ON c.id = bc.company_id
WHERE b.id= {selected_building_id};

-- All buildings that are "used" by a selected company
-- [ Company_admin ]
-- { selected_company_id }
SELECT b.id building_id, building_name, building_location
FROM Buildings b JOIN "Building-Company" bc ON b.id = bc.building_id JOIN Companies c ON c.id = bc.company_id
WHERE c.id = 2;

-- All charging types
-- [ Building_admin, Company_admin ? ]
SELECT * FROM Charging_types;

-- All charging stations
SELECT cs.id, name, ct.id type_id, type, b.id building_id, building_name, building_location
FROM Charging_stations cs JOIN Charging_types ct ON cs.charging_type_id = ct.id JOIN Buildings b ON cs.building_id = b.id;

-- All charging stations that belong to a selected building
-- [ Building_admin ]
-- { selected_building_id }
SELECT cs.id, name, ct.id type_id, type
FROM Charging_stations cs JOIN Charging_types ct ON cs.charging_type_id = ct.id JOIN Buildings b ON cs.building_id = b.id
WHERE b.id = {selected_building_id};

-- All consumers
SELECT *
FROM Consumers c JOIN Accounts a ON c.account_id = a.id ;

-- All guests
SELECT *
FROM Consumers c JOIN Accounts a ON c.account_id = a.id 
WHERE expiration_date IS NOT NULL;

/*
All code below is not finished, since Consumers table is a bit complex.
Some columns are nullable and because of that the tripple join fail.
Untested.
*/ 
-- All consumers that work for a selected company
-- [ Building_admin, Company_admin]
SELECT *
FROM Consumers c JOIN Accounts a ON c.account_id = a.id
WHERE c.company_id = 1;




--====== POST ======





--======= PUT =======
