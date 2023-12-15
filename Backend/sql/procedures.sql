-- PROCEDURES.SQL
-- Creates procedures or functions that the backend needs.
-- These procedures are mainly transactions or very complex queries
--
-- MEANT TO BE RUN ONCE

-- --------------- edit_building ---------------
-- Edit building info
-- /api/v1/building/patch/edit
-- edit_building(id, new_name?, new_location?, longitude?, latitude?)
CREATE OR REPLACE PROCEDURE edit_building(id_of_building int, new_name varchar(50), new_location varchar(50), new_longitude real, new_latitude real)
LANGUAGE plpgsql AS
$$
DECLARE
  old_name varchar(50);
  old_location varchar(50);
  old_longitude real;
  old_latitude real;
BEGIN
  SELECT building_name, building_location, longitude, latitude
    FROM Buildings
    WHERE id = id_of_building
    INTO old_name, old_location, old_longitude, old_latitude;
  
  IF NOT FOUND THEN
      RAISE EXCEPTION 'Building with ID % not found', id_of_building;
    END IF; 
  
  UPDATE Buildings SET
    building_name = COALESCE(new_name, old_name),
    building_location = COALESCE(new_location, old_location),
    longitude = COALESCE(new_longitude, old_longitude),
    latitude = COALESCE(new_latitude, old_latitude)
    WHERE id = id_of_building;
END
$$;


-- --------------- edit_station ---------------
-- Edit station info
-- /api/v1/station/patch/edit
-- edit_station(id, new_building_id?, new_name?)
CREATE OR REPLACE PROCEDURE edit_station(id_of_station int, new_building_id int, new_name varchar(50))
LANGUAGE plpgsql AS
$$
DECLARE
  old_building_id int;
  old_name varchar(50);
BEGIN
  SELECT building_id, "name"
    FROM charging_stations
    WHERE id = id_of_station
    INTO old_building_id, old_name;
  
  IF NOT FOUND THEN
      RAISE EXCEPTION 'Station with ID % not found', id_of_station;
    END IF; 
  
  UPDATE charging_stations SET
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
RETURNS TABLE (connector_id int, station_id int, station_name text, type_id int, charging_type text, building_id int, building_name text, building_location text,
              company_id int, company_name text, serial_number int)
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
          SELECT acc.company_id 
          FROM accounts acc
          WHERE id = user_id
        )
      ) LOOP
          ids_array := ids_array || ARRAY[id_temp];
      END LOOP;
    
    END IF;
    
    -- Select all stations using array of building_ids
    FOR rt IN (
      SELECT cc.id as connector_id, cs.id as station_id, cs.name as station_name,
      cc.charging_type_id as type_id, ct.type as charging_type,
      cs.building_id, b.building_name, b.building_location, cs.company_id, null, cc.serial_number
      FROM Charging_stations cs LEFT JOIN Charging_connectors cc ON cc.charging_station_id = cs.id
      LEFT JOIN Charging_types ct ON cc.charging_type_id = ct.id 
      LEFT JOIN Buildings b ON cs.building_id = b.id 
      LEFT JOIN Accounts acc ON acc.id = user_id
      WHERE b.id = ANY(ids_array::int[]) AND
      (cs.company_id IS NULL OR (acc.company_id IS NOT NULL AND acc.company_id = cs.company_id))
    ) LOOP
      connector_id := rt.connector_id;
      station_id := rt.station_id;
      station_name := rt.station_name;
      type_id := rt.type_id;
      charging_type := rt.charging_type;
      building_id := rt.building_id;
      building_name := rt.building_name;
      building_location := rt.building_location;
      company_id := rt.company_id;
      company_name := null;
      serial_number := rt.serial_number;
      RETURN NEXT;
    END LOOP;
    
END;
$$ LANGUAGE plpgsql;


-- --------------- get_all_available_for_building ---------------
-- Get All Avaiable connectors for a given building
-- Helper function for reservations
CREATE OR REPLACE FUNCTION get_all_available_for_building(user_id int, selected_building_id int)
RETURNS int[]
AS $$
DECLARE
    ids_array int[];
    id_temp int;
    rt record;
    rt_array int[];
BEGIN
    -- Get all building_id from building_accesses, if has any special
    FOR id_temp IN (
        SELECT ba.building_id 
        FROM building_accesses ba
        WHERE account_id = user_id
        AND selected_building_id = ba.building_id
    ) LOOP
        ids_array := ids_array || ARRAY[id_temp];
    END LOOP;
    
    -- If no specific building_access if given, use his primary company_id in accounts information
    IF ids_array IS NULL OR array_length(ids_array, 1) = 0 THEN
      FOR id_temp IN (
        SELECT bb.id
        FROM Buildings bb JOIN "Building-Company" bc ON bb.id = bc.building_id JOIN Companies cc ON cc.id = bc.company_id
        WHERE cc.id = (
          SELECT acc.company_id 
          FROM accounts acc
          WHERE id = user_id
        ) AND selected_building_id = bb.id
      ) LOOP
          ids_array := ids_array || ARRAY[id_temp];
      END LOOP;
    
    END IF;
    
    -- Select all stations using array of building_ids
    RETURN array(
      SELECT cc.id as connector_id
      FROM Charging_stations cs LEFT JOIN Charging_connectors cc ON cc.charging_station_id = cs.id
      LEFT JOIN Charging_types ct ON cc.charging_type_id = ct.id 
      LEFT JOIN Buildings b ON cs.building_id = b.id 
      LEFT JOIN Accounts acc ON acc.id = user_id
      WHERE b.id = ANY(ids_array::int[]) AND
      (cs.company_id IS NULL OR (acc.company_id IS NOT NULL AND acc.company_id = cs.company_id))
    );
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
end $$;

-- --------------- edit_connector ---------------
-- Edits a charging connector
-- /api/v1/station/connector/patch/edit
-- edit_connector(chargingConnectorID, chargingTypeID?, serialNumer?, power_output?)
CREATE OR REPLACE PROCEDURE edit_connector(id_of_connector int, new_type_id int, new_serial_number int, new_power_output int)
LANGUAGE plpgsql AS
$$
DECLARE
  old_type_id int;
  old_serial_number int;
  old_power_output int;
BEGIN
  SELECT charging_type_id, serial_number, power_output
    FROM Charging_connectors
    WHERE id = id_of_connector
    INTO old_type_id, old_serial_number, old_power_output;
  
  IF NOT FOUND THEN
      RAISE EXCEPTION 'Connector with ID % not found', id_of_connector;
    END IF; 
  
  UPDATE Charging_connectors SET
    charging_type_id = COALESCE(new_type_id, old_type_id),
    serial_number = COALESCE(new_serial_number, old_serial_number),
    power_output = COALESCE(new_power_output, old_power_output)
    WHERE id = id_of_connector;
END
$$;