-- PROCEDURES.SQL
-- Creates procedures or functions that the backend needs.
-- These procedures/functions are mainly transactions or very complex queries
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
              company_id int, company_name text, serial_number int, power_output int, building_longitude real, building_latitude real)
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
      cs.building_id, b.building_name, b.building_location, cs.company_id, null, cc.serial_number, cc.power_output,
      b.longitude, b.latitude
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
      power_output := rt.power_output;
      building_longitude := rt.longitude;
      building_latitude := rt.latitude;
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

-- ========================= RESERVATIONS =============================================

-- --------------- create_reservation ---------------
-- Creates a reservations, or tries to. If it doesn't find a full reservation, it puts it into a queue.
-- create_reservation(user_id_in int, desired_building_id_in int, charging_time_in int, desired_from_in timestamp, desired_to_in timestamp, desired_charging_type_id_in int)

-- Type is a table that gets returned. All paths return this table, while some values could be null.
CREATE TYPE reservation_info as (allocated_connector_id int, allocated_from timestamp, allocated_to timestamp, charging_time int, position_in_queue int);
CREATE OR REPLACE FUNCTION create_reservation(user_id_in int, desired_building_id_in int, charging_time_in int, desired_from_in timestamp, desired_to_in timestamp, desired_charging_type_id_in int)
RETURNS reservation_info
AS $$
DECLARE
  connector_array int[];
  current_connector_id int;
  result_record record;
  dz timestamp;
  dk timestamp;
  current_charging_time int;
  current_position_in_queue int;
  rt reservation_info;
BEGIN
  -- Get all possible connectors available to a person (for a building)
  SELECT * FROM get_all_available_for_building(user_id_in, desired_building_id_in) INTO connector_array;
  RAISE INFO 'Connectors: %', connector_array;
  
  -- Set current_position_in_queue in case we're gonna need it. This position doesn't change depending on our reservation.
  current_position_in_queue := (SELECT COALESCE(MAX(position_in_queue)+1, 1) FROM Reservations r_nest WHERE r_nest.desired_building_id = desired_building_id_in);
  current_charging_time := charging_time_in;
  -- Loop through charging times (from desired down to 1)
  WHILE current_charging_time > 0 
  LOOP
    RAISE INFO 'Now checking for charging time of % hours', current_charging_time;
    -- Loop through all connectors
    FOR current_connector_id IN SELECT UNNEST(connector_array)
    LOOP
      -- Check if desired charging type matches
      IF desired_charging_type_id_in IS NOT NULL THEN
        IF (SELECT charging_type_id FROM charging_connectors WHERE id=current_connector_id) != desired_charging_type_id_in THEN
          RAISE INFO 'Connectors type % does not match desired. Skipping.', (SELECT charging_type_id FROM charging_connectors WHERE id=current_connector_id);
          CONTINUE;
        END IF;
      END IF;
      -- Set "time window"
      dz := desired_from_in;
      dk := dz + INTERVAL '1 hour' * current_charging_time;
      RAISE INFO 'Now checking connector %', current_connector_id;
      -- Loop through all hours of a connector, moving time window an hour
      WHILE dk <= desired_to_in
      LOOP
        RAISE INFO 'Checking % to %', dz, dk;
        SELECT r.allocated_from, r.allocated_to FROM Reservations r
        INTO  result_record
        WHERE r.allocated_connector_id = current_connector_id  AND
        ((dz >= r.allocated_from  AND dz <  r.allocated_to)  OR
        (dk >  r.allocated_from  AND dk <= r.allocated_to));
        
        -- If clash isn't found, that means that a slot is possible
        IF NOT FOUND THEN
          RAISE NOTICE 'Slot found. Creating a reservation for % - %', dz, dk;
          -- If a slot with full charging_time hours was found, save normally, otherwise as queued
          IF current_charging_time = charging_time_in THEN  
            INSERT INTO reservations (
    	        account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, allocated_from, allocated_to, desired_building_id)
    	      VALUES (
    	        user_id_in, current_connector_id, desired_charging_type_id_in, now(), current_charging_time, desired_from_in, desired_to_in, dz, dk, desired_building_id_in
  	        );
            SELECT current_connector_id, dz, dk, current_charging_time, null INTO rt;
            RETURN rt;
          ELSE
            INSERT INTO reservations (
    	        account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, allocated_from, allocated_to, desired_building_id, position_in_queue)
    	      VALUES (
    	        user_id_in, current_connector_id, desired_charging_type_id_in, now(), current_charging_time, desired_from_in, desired_to_in, dz, dk, desired_building_id_in, current_position_in_queue
    	      );
            SELECT current_connector_id, dz, dk, current_charging_time, current_position_in_queue INTO rt;
            RETURN rt;
          END IF;
        END IF;
        -- Move the time window
        dz := dz + INTERVAL '1 hour';
        dk := dk + INTERVAL '1 hour';
      END LOOP;
    END LOOP;
    current_charging_time := current_charging_time - 1;
  END LOOP;
  
  RAISE NOTICE 'No suitable slots found. Putting in queue.';
  INSERT INTO reservations (
    account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, desired_building_id, position_in_queue)
  VALUES (
    user_id_in, null, desired_charging_type_id_in, now(), charging_time_in, desired_from_in, desired_to_in, desired_building_id_in, current_position_in_queue
  );
  
  SELECT null,null,null,charging_time_in, current_position_in_queue INTO rt;
  RETURN rt;
END;
$$ LANGUAGE plpgsql;


-- 





