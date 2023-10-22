CREATE OR REPLACE PROCEDURE test.delete_employee(userID integer)
language plpgsql
as $$
begin

-- Delete the user account.
-- The order of deletion is important do not change if you dont know what you are doing!
-- Building Accesses
UPDATE building_accesses
SET company_admin_id = null
WHERE company_admin_id = userID;

DELETE FROM building_accesses
WHERE account_id = userID;
-- Company Admins
DELETE FROM company_admins
WHERE account_id = userID;
-- Reservations
DELETE FROM reservations
WHERE account_id = userID;
-- Sessions
DELETE FROM sessions
WHERE account_id = userID;
-- Building Admins
DELETE FROM building_admins
WHERE account_id = userID;
-- Accounts
DELETE FROM accounts
WHERE id = userID;
end; $$