-- Seeding the database


-- Accounts
INSERT INTO Accounts ("username","password_hash", "password_salt","email_account","profile_picture") VALUES
    ('Term', 'lol','xd','jani.bangiev@islonline.com',':p'),
    ('sivictank123', 'lolol','xdddd','tadej.sivic@a1.si','sdfasdxycasdaizutv'),
    ('wazzadude', 'warthunder','1432131','wazzadude@discord.gg','-sdasdlikj6'),
    ('sivictank123_admin', 'god','god','tadej.sivic@a1.si', 'asd'),
    ('Term_b_admin', 'blol','bxd','jani.bangiev@islonline.com',':pb'),
    ('tadej_a1', 'god','god','tadej.sivic@a1.si', 'a1111111');


-- Companies
INSERT INTO Companies ("company_name") VALUES
    ('XLAB'),
    ('A1'),
    ('Lenovo');

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
INSERT INTO Consumers ("account_id","company_id", "building_id", "rfid") VALUES
    (1,1,null,184672),
    (2,2,2,510867123),
    (3,null,1,null);

-- Reservations
-- ???????

-- Sessions
INSERT INTO Sessions ("account_id", "session_secret", "expiration_time") VALUES
    (3, 'asudbšuba2šouisa', '13:14:00'),
    (2, '072d7ndns29jsdn', '13:58:00');