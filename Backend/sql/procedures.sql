-- PROCEDURES.SQL
-- Creates procedures that the backend needs.
-- These procedures are mainly transactions for implementing the PATCH API methods
--
-- MEANT TO BE RUN ONCE
--

--=============================== BUILDING ===============================

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











