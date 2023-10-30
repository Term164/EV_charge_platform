-- PROCEDURES.SQL
-- Creates procedures or functions that the backend needs.
-- These procedures are mainly transactions or very complex queries
--
-- MEANT TO BE RUN ONCE

-- --------------- edit_building ---------------
-- Edit building info
-- /api/v1/building/patch/edit
-- edit_building(id, new_name?, new_location?)
CREATE OR REPLACE PROCEDURE edit_building(id_of_building int, new_name varchar(50), new_location varchar(50))
LANGUAGE plpgsql AS
$$
DECLARE
  old_name varchar(50);
  old_location varchar(50);
BEGIN
  SELECT building_name, building_location
    FROM Buildings
    WHERE id = id_of_building
    INTO old_name, old_location;
  
  IF NOT FOUND THEN
      RAISE EXCEPTION 'Building with ID % not found', id_of_building;
    END IF; 
  
  UPDATE Buildings SET
    building_name = COALESCE(new_name, old_name),
    building_location = COALESCE(new_location, old_location)
    WHERE id = id_of_building;
END
$$;


-- --------------- edit_station ---------------
-- Edit station info
-- /api/v1/station/patch/edit
-- edit_station(id, new_type_id?, new_building_id?, new_name?)
CREATE OR REPLACE PROCEDURE edit_station(id_of_station int, new_type_id int, new_building_id int, new_name varchar(50))
LANGUAGE plpgsql AS
$$
DECLARE
  old_type_id int;
  old_building_id int;
  old_name varchar(50);
BEGIN
  SELECT charging_type_id, building_id, "name"
    FROM charging_stations
    WHERE id = id_of_station
    INTO old_type_id, old_building_id, old_name;
  
  IF NOT FOUND THEN
      RAISE EXCEPTION 'Station with ID % not found', id_of_station;
    END IF; 
  
  UPDATE charging_stations SET
    charging_type_id = COALESCE(new_type_id, old_type_id),
    building_id = COALESCE(new_building_id, old_building_id),
    "name" = COALESCE(new_name, old_name)
    WHERE id = id_of_station;
END
$$;


-- --------------- get_all_available ---------------
-- Get All Avaiable Stations
-- /api/v1/station/get/allAvailable
-- edit_station(user_id)
CREATE OR REPLACE FUNCTION get_all_available(user_id int)
RETURNS TABLE (station_id int, station_name text, type_id int, "type" text, building_id int, building_name text, building_location text)
AS $$
DECLARE
    ids_array int[];
    id_temp int;
    rt record;
BEGIN
    -- Get all building_id from building_accesses, if has any special
    FOR id_temp IN (
        SELECT ba.building_id 
        FROM building_accesses ba
        WHERE account_id = user_id
    ) LOOP
        ids_array := ids_array || ARRAY[id_temp];
    END LOOP;
    
    -- If no specific building_access if given, use his primary company_id in accounts information
    IF ids_array IS NULL OR array_length(ids_array, 1) = 0 THEN
      FOR id_temp IN (
        SELECT bb.id
        FROM Buildings bb JOIN "Building-Company" bc ON bb.id = bc.building_id JOIN Companies cc ON cc.id = bc.company_id
        WHERE cc.id = (
          SELECT company_id 
          FROM accounts acc
          WHERE id = user_id
        )
      ) LOOP
          ids_array := ids_array || ARRAY[id_temp];
      END LOOP;
    
    END IF;
    
    -- Select all stations using array of building_ids
    FOR rt IN (
      SELECT cs.id as station_id, name as station_name, ct.id as type_id, ct.type as "type", b.id as building_id, b.building_name, b.building_location
      FROM Charging_stations cs JOIN Charging_types ct ON cs.charging_type_id = ct.id JOIN Buildings b ON cs.building_id = b.id JOIN Accounts acc ON acc.id = user_id
      WHERE b.id = ANY(ids_array::int[]) AND
      (cs.company_id IS NULL OR (acc.company_id IS NOT NULL AND acc.company_id = cs.company_id))
    ) LOOP
      station_id := rt.station_id;
      station_name := rt.station_name;
      type_id := rt.type_id;
      "type" := rt.type;
      building_id := rt.building_id;
      building_name := rt.building_name;
      building_location := rt.building_location;
      RETURN NEXT;
    END LOOP;
    
END;
$$ LANGUAGE plpgsql;


-- --------------- delete_employee ---------------
-- Deletes an account from multiple places
CREATE OR REPLACE PROCEDURE delete_employee(userID integer)
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

