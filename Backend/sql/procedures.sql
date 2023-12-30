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

-- ====================================
-- | Helper function for reservations |
-- ====================================
-- --------------- get_all_available_for_building ---------------
-- Get All Avaiable connectors for a given building to a user

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
      ORDER BY RANDOM()
    );
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- | Helper function for reservations |
-- ====================================
-- --------------- get_all_available_types_for_building_for_user ---------------
-- Get All Avaiable charging types for a given building to a user

CREATE OR REPLACE FUNCTION get_all_available_types_for_building_for_user(user_id int, building_id int)
RETURNS int[]
AS $$
DECLARE
  result_array int[];
  connector_array int[];
  current_connector_id int;
  current_charging_type int;
BEGIN
  
  SELECT * FROM get_all_available_for_building(user_id, building_id) INTO connector_array;
  RAISE NOTICE 'got %', connector_array;
  FOR current_connector_id IN SELECT UNNEST(connector_array)
  LOOP
    SELECT charging_type_id
    INTO current_charging_type
    FROM charging_connectors
    WHERE id = current_connector_id;
    RAISE NOTICE 'connector % has type %', current_connector_id, current_charging_type;
    
    IF current_charging_type NOT IN (SELECT UNNEST(result_array)) OR result_array IS NULL THEN
      result_array := result_array || ARRAY[current_charging_type];
    END IF;
    
    RAISE NOTICE 'result array: %', result_array;
    
  END LOOP;
  
  RETURN result_array;
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

-- ---------------- created_reservation_info ---------------
-- Custom data type. A "table" that gets returned (multiple rows). All paths return this table, while some values could be null.
-- Is returned by create_reservation or cancel_reservation - anytime a reservation is created or updated.
CREATE TYPE created_reservation_info as (user_id int, allocated_connector_id int, allocated_from timestamp, allocated_to timestamp, charging_time int, position_in_queue int);

-- --------------- create_reservation ---------------
-- Creates a reservations, or tries to. If it doesn't find a full reservation, it puts it into a queue.
-- create_reservation(user_id_in int, desired_building_id_in int, charging_time_in int, desired_from_in timestamp, desired_to_in timestamp, desired_charging_type_id_in int)

CREATE OR REPLACE FUNCTION create_reservation(user_id_in int, desired_building_id_in int, charging_time_in int, desired_from_in timestamp, desired_to_in timestamp, desired_charging_type_id_in int)
RETURNS created_reservation_info
AS $$
DECLARE
  connector_array int[];
  current_connector_id int;
  result_record record;
  dz timestamp;
  dk timestamp;
  current_charging_time int;
  current_position_in_queue int;
  rt created_reservation_info;
BEGIN
  -- Get all possible connectors available to a person (for a building)
  SELECT * FROM get_all_available_for_building(user_id_in, desired_building_id_in) INTO connector_array;
  RAISE INFO 'Connectors: %, length %, is null %', connector_array, array_length(connector_array, 1), connector_array IS NULL;
  IF array_length(connector_array, 1) IS NULL THEN
    RAISE EXCEPTION 'Array of possible connectors is empty. Either user doesnt exist, or he really cant use any connectors, in which case he shouldnt even be here.';
  END IF;
  
  -- Set current_position_in_queue in case we're gonna need it. This position doesn't change depending on our reservation.
  current_position_in_queue := (
    SELECT COALESCE(MAX(position_in_queue)+1, 1) FROM Reservations r_nest 
    WHERE r_nest.desired_building_id = desired_building_id_in AND DATE(r_nest.desired_from) = DATE(desired_from_in)
  );
  current_charging_time := charging_time_in;
  -- Loop through charging times (from desired down to 1)
  WHILE current_charging_time > 0 
  LOOP
    RAISE INFO 'Now checking for charging time of % hours', current_charging_time;
    -- Loop through all connectors
    FOR current_connector_id IN SELECT UNNEST(connector_array)
    LOOP
      RAISE INFO 'Now checking connector %', current_connector_id;
      -- Check if desired charging type matches
      IF desired_charging_type_id_in IS NOT NULL THEN
        IF (SELECT charging_type_id FROM charging_connectors WHERE id=current_connector_id) != desired_charging_type_id_in THEN
          RAISE INFO 'Connectors type % does not match desired. Skipping.', (SELECT charging_type_id FROM charging_connectors WHERE id=current_connector_id);
          CONTINUE;
        END IF;
      END IF;
      RAISE INFO 'Connectors type matches!';
      -- Set "time window"
      dz := desired_from_in;
      dk := dz + INTERVAL '1 hour' * current_charging_time;
      
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
    	        user_id_in, current_connector_id, desired_charging_type_id_in, now(), charging_time_in, desired_from_in, desired_to_in, dz, dk, desired_building_id_in
  	        );
            SELECT user_id_in, current_connector_id, dz, dk, current_charging_time, null INTO rt;
            RETURN rt;
          ELSE
            INSERT INTO reservations (
    	        account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, allocated_from, allocated_to, desired_building_id, position_in_queue)
    	      VALUES (
    	        user_id_in, current_connector_id, desired_charging_type_id_in, now(), charging_time_in, desired_from_in, desired_to_in, dz, dk, desired_building_id_in, current_position_in_queue
    	      );
            SELECT user_id_in, current_connector_id, dz, dk, current_charging_time, current_position_in_queue INTO rt;
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
  SELECT user_id_in,null,null,null,charging_time_in,current_position_in_queue INTO rt;
  RETURN rt;
END;
$$ LANGUAGE plpgsql;

-- --------------- cancel_reservation ---------------
-- Deletes a reservation and updates the queue.
-- cancel_reservation(reservation_id int)

CREATE OR REPLACE FUNCTION cancel_reservation(reservation_id_in int)
RETURNS SETOF created_reservation_info
AS $$
DECLARE
  canceling_reservation reservations%ROWTYPE;
  canceled_position int;
  rt created_reservation_info;
BEGIN
  -- Gather reservation info, we're gonna need it
  SELECT * 
  INTO canceling_reservation
  FROM reservations 
  WHERE id = reservation_id_in;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bad request. Reservation with id % not found.', reservation_id_in;
  END IF;
  RAISE INFO 'Found reservation %', canceling_reservation;
  
  canceled_position := canceling_reservation.position_in_queue;
  RAISE INFO 'canceled position %', canceled_position;
  -- Update the queue positions, if the canceled reservation was in one
  IF canceled_position IS NOT NULL THEN
    UPDATE reservations
    SET position_in_queue = position_in_queue - 1
    WHERE position_in_queue > canceled_position
    AND desired_building_id = canceling_reservation.desired_building_id
    AND DATE(desired_from) = DATE(canceling_reservation.desired_from);
    RAISE INFO '(cancel_reservation) Fixed queue position for greater that %', canceled_position;
  END IF;
  
  -- Actually delete the reservation
  DELETE FROM reservations
  WHERE id = reservation_id_in;
  RAISE INFO 'Deleted reservation %', reservation_id_in;
  
  -- Finally, update the queue to fill an empty spot, if there was one
  FOR rt IN (SELECt * FROM update_queue(canceling_reservation.desired_building_id, DATE(canceling_reservation.desired_from)) )
  LOOP
    RAISE INFO '(%) call update retrnd %', canceling_reservation.desired_building_id, rt;
    RETURN NEXT rt;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- | Helper function for reservations |
-- ====================================
-- --------------- update_queue ---------------
-- Jump starts the queue update process.

CREATE OR REPLACE FUNCTION update_queue(desired_building_id_in int, desired_date_in date)
RETURNS SETOF created_reservation_info
AS $$
DECLARE
  next_in_queue reservations%ROWTYPE;
  allocated_charging_time int;
  
  rt created_reservation_info;
BEGIN
  -- Get reservation info for first in queue
  SELECT * 
  INTO next_in_queue
  FROM reservations 
  WHERE desired_building_id = desired_building_id_in AND
  DATE(desired_from) = desired_date_in AND
  position_in_queue = 1;

  IF NOT FOUND THEN
    RAISE NOTICE 'Nobody found in queue. Nothing done.';
    RETURN;
  END IF;
  RAISE INFO 'Found first in queue: %', next_in_queue;
  
  -- Loop through all returned rows
  FOR rt IN (SELECT * FROM update_queue_for_position(desired_building_id_in, 1, desired_date_in)) 
  LOOP
    RAISE INFO 'Main has received %', rt;
    RETURN NEXT rt;
  END LOOP;
  
  RETURN;
  
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- | Helper function for reservations |
-- ====================================
-- --------------- update_queue_for_position ---------------
-- Updates the queue for a given building, date and queue position.
-- Appropriately calls queue update for next in line (so kind of recursively)

CREATE OR REPLACE FUNCTION update_queue_for_position(desired_building_id_in int, position_in_queue_in int, desired_date_in date)
RETURNS SETOF created_reservation_info
AS $$
DECLARE
  next_in_queue reservations%ROWTYPE;
  allocated_charging_time int;
  
  -- Support vars, for looping
  current_charging_time int;
  connector_array int[];
  current_connector_id int;
  result_record record;
  dz timestamp;
  dk timestamp;
--  current_position_in_queue int;
  rt created_reservation_info;
  
BEGIN
  -- Get reservation info for next in queue
  SELECT * 
  INTO next_in_queue
  FROM reservations 
  WHERE desired_building_id = desired_building_id_in AND
  DATE(desired_from) = desired_date_in AND
  position_in_queue = position_in_queue_in;

  IF NOT FOUND THEN
    RAISE NOTICE 'Nobody found in queue. Nothing done.';
    RETURN;
  END IF;
  RAISE INFO 'Found in queue: %', next_in_queue;

-- Get all possible connectors available to a person (for a building)
  SELECT * FROM get_all_available_for_building(next_in_queue.account_id, next_in_queue.desired_building_id) INTO connector_array;
  RAISE INFO 'Connectors: %', connector_array;
  IF array_length(connector_array, 1) IS NULL THEN
    RAISE EXCEPTION 'Array of possible connectors is empty. Either user doesnt exist, or he really cant use any connectors, in which case he shouldnt even be here.';
  END IF;

  current_charging_time := next_in_queue.charging_time;
  -- Calculate allocated charging time difference in hours (if allocated)
  IF next_in_queue.allocated_from IS NULL OR next_in_queue.allocated_to IS NULL THEN
    allocated_charging_time := 0;
  ELSE
    allocated_charging_time := EXTRACT (EPOCH FROM (next_in_queue.allocated_to::timestamptz - next_in_queue.allocated_from::timestamptz)) / 3600;
  END IF;
  RAISE INFO 'Allocated charging time %', allocated_charging_time;
  
  -- Loop through charging times (from desired down to already allocated)
  -- That means if a user has 2 hours allocated, only allocate if 3 hours are available, don't move him or shorten his time
  WHILE current_charging_time > allocated_charging_time
  LOOP
    RAISE INFO 'Now checking for charging time of % hours', current_charging_time;

    -- If update is happening TODAY, so desired from/to date is the same as today, the process changes a bit.
    -- If the case, we can only extend the user's reservation, do not move him even if a longer slot is available
    IF CURRENT_DATE = DATE(next_in_queue.desired_from) AND allocated_charging_time != 0 THEN
      RAISE INFO 'Desired time is TODAY. Switching to extension only.';
      dz := next_in_queue.allocated_from;
      dk := dz + INTERVAL '1 hour' * current_charging_time;
      WHILE dk <= next_in_queue.desired_to
      LOOP
        IF current_charging_time <= allocated_charging_time THEN
          RAISE NOTICE 'No Extension possible. Aborting.';
          -- check
          RETURN;
        END IF;
        
        RAISE INFO 'Trying to extend to % hours', current_charging_time;
        SELECT r.allocated_from, r.allocated_to FROM Reservations r
        INTO  result_record
        WHERE r.id != next_in_queue.id AND -- Skip our own reservation
        ((dz >= r.allocated_from  AND dz <  r.allocated_to)   OR
        (dk  >  r.allocated_from  AND dk <= r.allocated_to));
          
        -- If clash isn't found, that means that a slot is possible
        IF NOT FOUND THEN
          -- clear original reservation
          DELETE FROM reservations WHERE id = next_in_queue.id;
          RAISE NOTICE '(% %) Extension possible for % - %',desired_building_id_in, position_in_queue_in, dz, dk;
          -- If a slot with full charging_time hours was found, it means the person is no longer queued. Fix queue positions.
          IF current_charging_time = next_in_queue.charging_time THEN
            UPDATE reservations
              SET position_in_queue = position_in_queue - 1
              WHERE position_in_queue > next_in_queue.position_in_queue
              AND desired_building_id = next_in_queue.desired_building_id
              AND DATE(desired_from) = DATE(next_in_queue.desired_from);
            RAISE INFO '(% %) Fixed queue position for greater that %', desired_building_id_in, position_in_queue_in, next_in_queue.position_in_queue;
            
            INSERT INTO reservations (
    	        account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, allocated_from, allocated_to, desired_building_id)
    	      VALUES (
    	        next_in_queue.account_id, next_in_queue.allocated_connector_id, next_in_queue.desired_charging_type_id, now(), next_in_queue.charging_time, next_in_queue.desired_from,
    	        next_in_queue.desired_to, dz, dk, next_in_queue.desired_building_id
  	        );
            SELECT next_in_queue.account_id, next_in_queue.allocated_connector_id, dz, dk, current_charging_time, null INTO rt;
            RAISE INFO 'Im gonna return %', rt;
            RETURN NEXT rt;
            
            -- Loop through result since functions return more than one row
            FOR rt IN (SELECT * FROM update_queue_for_position(desired_building_id_in, next_in_queue.position_in_queue, desired_date_in))
            LOOP
              RAISE INFO '(% %) call full retrnd %', desired_building_id_in,position_in_queue_in,rt;
              RETURN NEXT rt;
            END LOOP;
          
            RETURN;
          ELSE
            INSERT INTO reservations (
    	        account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, allocated_from, allocated_to, desired_building_id, position_in_queue)
    	      VALUES (
    	        next_in_queue.account_id, next_in_queue.allocated_connector_id, next_in_queue.desired_charging_type_id, now(), next_in_queue.charging_time, next_in_queue.desired_from,
    	        next_in_queue.desired_to, dz, dk, next_in_queue.desired_building_id, next_in_queue.position_in_queue
    	      );
            SELECT next_in_queue.account_id, next_in_queue.allocated_connector_id, dz, dk, current_charging_time, next_in_queue.position_in_queue INTO rt;
            RAISE INFO 'Im gonna return %', rt;
            RETURN NEXT rt;
            
            -- Loop through all returned rows
            FOR rt IN (SELECT * FROM update_queue_for_position(desired_building_id_in, next_in_queue.position_in_queue + 1, desired_date_in)) 
            LOOP
              RAISE INFO '(% %) extension partial retrnd %', desired_building_id_in,position_in_queue_in,rt;
              RETURN NEXT rt;
            END LOOP;
            
            RETURN;
          END IF;
          
        END IF;
        current_charging_time := current_charging_time - 1;
        dk := dz + INTERVAL '1 hour' * current_charging_time;
      END LOOP;
    END IF;
    
    -- Loop through all connectors
    FOR current_connector_id IN SELECT UNNEST(connector_array)
    LOOP
      RAISE INFO 'Now checking connector %', current_connector_id;
      -- Check if desired charging type matches
      IF next_in_queue.desired_charging_type_id IS NOT NULL THEN
        IF (SELECT charging_type_id FROM charging_connectors WHERE id=current_connector_id) != next_in_queue.desired_charging_type_id THEN
          RAISE INFO 'Connectors type % does not match desired. Skipping.', (SELECT charging_type_id FROM charging_connectors WHERE id=current_connector_id);
          CONTINUE;
        END IF;
      END IF;
      RAISE INFO 'Connectors type matches!';
      -- Set "time window"
      dz := next_in_queue.desired_from;
      dk := dz + INTERVAL '1 hour' * current_charging_time;
      
      -- Loop through all hours of a connector, every iteration we move time window for an hour
      WHILE dk <= next_in_queue.desired_to
      LOOP
        RAISE INFO 'Checking % to %', dz, dk;
        SELECT r.allocated_from, r.allocated_to FROM Reservations r
        INTO  result_record
        WHERE r.allocated_connector_id = current_connector_id AND
        r.id != next_in_queue.id  AND -- Skip our own reservation
        ((dz >= r.allocated_from  AND dz <  r.allocated_to)   OR
        (dk  >  r.allocated_from  AND dk <= r.allocated_to));
        
        -- If clash isn't found, that means that a slot is possible
        IF NOT FOUND THEN
          RAISE INFO 'Deleting old reservation %', next_in_queue.id;
          DELETE FROM reservations WHERE id = next_in_queue.id;
          
          RAISE NOTICE '(% %) Slot found. Creating a reservation for % - %',desired_building_id_in, position_in_queue_in, dz, dk;
          -- If a slot with full charging_time hours was found, it means the person is no longer queued. Fix queue positions.
          IF current_charging_time = next_in_queue.charging_time THEN
            UPDATE reservations
            SET position_in_queue = position_in_queue - 1
            WHERE position_in_queue > next_in_queue.position_in_queue
            AND desired_building_id = next_in_queue.desired_building_id
            AND DATE(desired_from) = DATE(next_in_queue.desired_from);
            RAISE INFO '(% %) Fixed queue position for greater that %', desired_building_id_in, position_in_queue_in, next_in_queue.position_in_queue;
            
            INSERT INTO reservations (
    	        account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, allocated_from, allocated_to, desired_building_id)
    	      VALUES (
    	        next_in_queue.account_id, current_connector_id, next_in_queue.desired_charging_type_id, now(), next_in_queue.charging_time, next_in_queue.desired_from,
    	        next_in_queue.desired_to, dz, dk, next_in_queue.desired_building_id
  	        );
            SELECT next_in_queue.account_id, current_connector_id, dz, dk, current_charging_time, null INTO rt;
            RAISE INFO 'Im gonna return %', rt;
            RETURN NEXT rt;
            
            -- Loop through result since functions return more than one row
            FOR rt IN (SELECT * FROM update_queue_for_position(desired_building_id_in, next_in_queue.position_in_queue, desired_date_in))
            LOOP
              RAISE INFO '(% %) call full retrnd %', desired_building_id_in,position_in_queue_in,rt;
              RETURN NEXT rt;
            END LOOP;
            
            RETURN;
          ELSE
            INSERT INTO reservations (
    	        account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, allocated_from, allocated_to, desired_building_id, position_in_queue)
    	      VALUES (
    	        next_in_queue.account_id, current_connector_id, next_in_queue.desired_charging_type_id, now(), next_in_queue.charging_time, next_in_queue.desired_from,
    	        next_in_queue.desired_to, dz, dk, next_in_queue.desired_building_id, next_in_queue.position_in_queue
    	      );
            SELECT next_in_queue.account_id, current_connector_id, dz, dk, current_charging_time, next_in_queue.position_in_queue INTO rt;
            RAISE INFO 'Im gonna return %', rt;
            RETURN NEXT rt;
            
            -- Loop through all returned rows
            FOR rt IN (SELECT * FROM update_queue_for_position(desired_building_id_in, next_in_queue.position_in_queue + 1, desired_date_in)) 
            LOOP
              RAISE INFO '(% %) call partial retrnd %', desired_building_id_in,position_in_queue_in,rt;
              RETURN NEXT rt;
            END LOOP;
            
            RETURN;
          END IF;
        END IF;
        
        -- Move the time window
        dz := dz + INTERVAL '1 hour';
        dk := dk + INTERVAL '1 hour';
      END LOOP;
    END LOOP;
    current_charging_time := current_charging_time - 1;
  END LOOP;
  
  RAISE NOTICE 'No suitable slots found. Updating next one.';
  SELECT next_in_queue.account_id, next_in_queue.allocated_connector_id, dz, dk, current_charging_time, next_in_queue.position_in_queue INTO rt;
  RAISE INFO 'no slots would return %', rt;
  --RETURN NEXT rt;
  -- Loop through all returned rows
  FOR rt IN (SELECT * FROM update_queue_for_position(desired_building_id_in, next_in_queue.position_in_queue + 1, desired_date_in)) 
  LOOP
    RAISE INFO '(% %) call next retrnd %', desired_building_id_in,position_in_queue_in,rt;
    RETURN NEXT rt;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- --------------- edit_reservation ---------------
-- Edit a reservation
-- All fields except reservationID are nullable
-- -> desiredChargingTypeID is -1 if wish to set to null (if null, it is ignored in the editing process)

CREATE OR REPLACE FUNCTION edit_reservation(reservation_id_in int, desired_from_in timestamp, desired_to_in timestamp, charging_time_in int, desired_charging_type_id_in int)
RETURNS SETOF created_reservation_info
AS $$
DECLARE
  edited_reservation reservations%ROWTYPE;
  
  queued bool;
  reserved bool;
  rt created_reservation_info;
BEGIN
  -- Gather reservation info, we're gonna need it
  SELECT * 
  INTO edited_reservation
  FROM reservations 
  WHERE id = reservation_id_in;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bad request. Reservation with id % not found.', reservation_id_in;
  END IF;
  RAISE INFO 'Found reservation %', edited_reservation;
  
  -- figure out his current reservation status
  queued := edited_reservation.position_in_queue IS NOT NULL;
  reserved := edited_reservation.allocated_connector_id IS NOT NULL;
  RAISE INFO 'Status is: queued=%, reserved=%', queued, reserved;
  
  IF NOT queued AND NOT reserved THEN
    RAISE EXCEPTION 'Logic error: queued=%, reserved=%, bad row: %', queued, reserved, edited_reservation;
  END IF;
  
  -- Case 1: When completely queued.
  -- Just edit his reservation and update_q
  IF queued AND NOT reserved THEN
  RAISE INFO 'queued and not reserved';
    -- Edit reservation
    UPDATE reservations SET
      desired_from = COALESCE(desired_from_in, edited_reservation.desired_from),
      desired_to = COALESCE(desired_to_in, edited_reservation.desired_to),
      charging_time = COALESCE(charging_time_in, edited_reservation.charging_time),
      desired_charging_type_id = (CASE WHEN desired_charging_type_id_in = -1 THEN null ELSE COALESCE(desired_charging_type_id_in, edited_reservation.desired_charging_type_id) END)
      WHERE id = reservation_id_in;
    
    -- Update Q, if this edit did anything, it will get allocated
    FOR rt IN (SELECT * FROM update_queue(edited_reservation.desired_building_id, DATE(edited_reservation.desired_from)) )
    LOOP
      RAISE INFO '(%) edit update retrnd %', edited_reservation.desired_building_id, rt;
      RETURN NEXT rt;
    END LOOP;
    RETURN;
  END IF;

  -- Case 2: When reserved
  -- Make a new reservation with new parameters, set position to 1 or already existing, cancel old one (cancel will fix Q)
  IF reserved THEN
    IF NOT queued THEN
    RAISE INFO 'reserved and not queued';
    -- Completely reserved, make new with position 1, 
      UPDATE reservations
      SET position_in_queue = position_in_queue + 1
      WHERE desired_building_id = edited_reservation.desired_building_id
      AND DATE(desired_from) = DATE(edited_reservation.desired_from);
        
      INSERT INTO reservations (
        account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, desired_building_id, position_in_queue)
      VALUES (
        edited_reservation.account_id, null, (CASE WHEN desired_charging_type_id_in = -1 THEN null ELSE COALESCE(desired_charging_type_id_in, edited_reservation.desired_charging_type_id) END),
        now(), COALESCE(charging_time_in, edited_reservation.charging_time), COALESCE(desired_from_in, edited_reservation.desired_from),
        COALESCE(desired_to_in, edited_reservation.desired_to), edited_reservation.desired_building_id, 1
      );
    ELSE
    RAISE INFO 'reserved and queued';
    -- Partially queued, make new with same position
      INSERT INTO reservations (
        account_id, allocated_connector_id, desired_charging_type_id, creation_time, charging_time, desired_from, desired_to, desired_building_id, position_in_queue)
      VALUES (
        edited_reservation.account_id, null, (CASE WHEN desired_charging_type_id_in = -1 THEN null ELSE COALESCE(desired_charging_type_id_in, edited_reservation.desired_charging_type_id) END),
        now(), COALESCE(charging_time_in, edited_reservation.charging_time), COALESCE(desired_from_in, edited_reservation.desired_from), 
        COALESCE(desired_to_in, edited_reservation.desired_to), edited_reservation.desired_building_id, edited_reservation.position_in_queue
      );
    END IF;
    -- Finally cancel old reservation
    FOR rt IN (SELECT * FROM cancel_reservation(edited_reservation.id) )
    LOOP
      RAISE INFO '(%) test retrnd %', edited_reservation.desired_building_id, rt;
      RETURN NEXT rt;
    END LOOP;
    RETURN;
  
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;
