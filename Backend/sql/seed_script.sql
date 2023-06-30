-- Seeding the database

-- Companies
INSERT INTO Companies ("company_name") VALUES
    ('XLAB'),
    ('A1'),
    ('Lenovo');

-- Accounts
INSERT INTO Accounts ("username","password_hash", "password_salt","email_account","profile_picture", "rfid", "company_id") VALUES
    ('Term', 'lol','xd','jani.bangiev@islonline.com',':p', 12547, 1),
    ('sivictank123', 'lolol','xdddd','tadej.sivic@a1.si','sdfasdxycasdaizutv', 9867124, 1),
    ('wazzadude', 'warthunder','1432131','wazzadude@discord.gg','-sdasdlikj6', 16234, 2),
    ('sivictank123_admin', 'god','god','tadej.sivic@a1.si', 'asd', null, 2),
    ('Term_b_admin', 'blol','bxd','jani.bangiev@islonline.com',':pb', null, 1),
    ('tadej_a1', 'god','god','tadej.sivic@a1.si', 'a1111111', null, 3);

-- Buildings
INSERT INTO Buildings ("building_name", "building_location") VALUES
    ('TEHNOLOŠKI PARK - STAVBA G', 'Večna pot 150'),
    ('A1 poslovna stavba', 'Ameriška ulica 4'),
    ('A1 Maribor','Mariborska cesta');

-- Charging Types
INSERT INTO Charging_types ("type") VALUES 
    ('45W'),
    ('20W'),
    ('15W'),
    ('Ostalo');

-- Charging Stations
INSERT INTO Charging_stations ("charging_type_id", "building_id", "name") VALUES
    (1, 1, 'Hitra 1'),
    (1, 1, 'Hitra 2'),
    (1, 1, 'Hitra 3'),
    (3, 1, 'Počasna 1'),
    (3, 1, 'Počasna 2'),
    (3, 1, 'Počasna 3'),
    (1, 2, 'Hitra A1'),
    (1, 2, 'Hitra A2'),
    (2, 2, 'Srednja A1'),
    (3, 2, 'Počasna A1');

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

-- Reservations
-- ???????

-- Sessions
INSERT INTO Sessions ("account_id", "session_secret", "expiration_time") VALUES
    (3, 'asudbšuba2šouisa', NOW()+ interval '30 minutes'),
    (2, '072d7ndns29jsdn', NOW()+ interval '90 minutes');