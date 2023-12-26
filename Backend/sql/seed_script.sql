-- Seeding the database
--
-- MEANT TO BE RUN ONCE
--

-- Companies
INSERT INTO Companies ("company_name") VALUES
    ('XLAB'),
    ('A1'),
    ('Lenovo'),
    ('Arriva');

-- Accounts
INSERT INTO Accounts ("username","password_hash", "email_account", "rfid", "company_id") VALUES
    ('Term', 'lol','jani.bangiev@islonline.com', 12547, 1),
    ('sivictank123', 'lolol','tadej.sivic@a1.si', 9867124, 1),
    ('wazzadude', 'warthunder','wazzadude@discord.gg', 16234, 2),
    ('sivictank123_admin', 'god','tadej.sivic@a1.si', null, 2),
    ('Term_b_admin', 'blol','jani.bangiev@islonline.com', null, 1),
    ('tadej_a1', 'god','tadej.sivic@a1.si', null, 3);

-- Buildings
INSERT INTO Buildings ("building_name", "building_location", "longitude", "latitude") VALUES
    ('TEHNOLOŠKI PARK - STAVBA G', 'Večna pot 150', 14.460913, 46.048447),
    ('A1 poslovna stavba', 'Ameriška ulica 4', 14.540685, 46.067772),
    ('A1 Maribor','Mariborska cesta', 15.650402, 46.55936);

-- Charging Types
INSERT INTO Charging_types ("type") VALUES 
    ('TYPE1'),
    ('TYPE2'),
    ('CHAdeMO'),
    ('CSS'),
    ('TESLASUC');

-- Charging Stations
INSERT INTO Charging_stations ("building_id", "name") VALUES
    (1, 'Hitra 1'),
    (1, 'Hitra 2'),
    (1, 'Hitra 3'),
    (3, 'Počasna 1'),
    (3, 'Počasna 2'),
    (2, 'Hitra A1'),
    (2, 'Srednja A1');

-- Charging connectors
INSERT INTO Charging_connectors ("charging_type_id", "charging_station_id", "serial_number", "power_output") VALUES
    (1, 1, 1, 25),
    (1, 2, 1, 45),
    (1, 3, 1, 20),
    (3, 4, 1, 35),
    (3, 4, 2, 60),
    (3, 5, 1, 70),
    (3, 5, 2, 80),
    (1, 6, 1, 90),
    (2, 7, 1, 69);

-- Platform admins
INSERT INTO Platform_admins ("account_id") VALUES (4);

-- Building admins
INSERT INTO Building_admins ("account_id", "building_id") VALUES (5,2);

-- Company admins
INSERT INTO Company_admins ("account_id", "company_id") VALUES (6,2);

-- Building-company
INSERT INTO "Building-Company" ("company_id","building_id") VALUES
    (1,1),
    (3,1),
    (2,2),
    (2,3);

-- Consumers
INSERT INTO Building_accesses ("account_id", "building_id", "company_admin_id") VALUES
    (1,1,1),
    (1,2,1),
    (1,3,1),
    (2,1,1);

-- Sessions
INSERT INTO Sessions ("account_id", "session_secret", "expiration_time") VALUES
    (3, 'asudbšuba2šouisa', NOW()+ interval '30 minutes'),
    (2, '072d7ndns29jsdn', NOW()+ interval '90 minutes');