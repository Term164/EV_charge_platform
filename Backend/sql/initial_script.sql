-- Prepared for PostgreSQL
-- Use the picture ER_diagram.png for reference
--
-- Version history: the last version number is the current one.
--=============================================
-- V 1.0
-- -> Inital script
--=============================================
-- V 2.0
-- -> Fixes definitons for ID primary keys
-- -> Fixes PK, FK numbers
--=============================================
-- V 2.1
-- -> Adds an attribute "company_id" in table "charging_stations", so now a company can reserve a station
-- -> Adds a table called "Sessions" for storing sessions ids / tokens / secrets, all security wise
--=============================================
-- V 2.2
-- -> Changes 'expiration_time' to timestmap, not just time (timestamp is date+time)
-- -> Adds attribute "validated" in "accounts" table
--=============================================
-- V 2.3
-- -> Restructures the table 'Consumers' into 'Building_accesses', which changes the then 'company_id'
-- into 'company_admin_id', which changes the relationship (points to different table)
-- -> 'RFID' and 'company_id' have been moved to 'Accounts' table, since it's person dependent
--=============================================
-- V 2.4
-- -> Adds 'regtistration_secrets' table for creating step 2 of registration urls
--=============================================
-- V 2.5
-- -> Removes foreign key constraint on 'company_admin_id' from 'building_accesses'. This is to avoid losing access data in case that company admin is no more.
-- -> Adds 'email_account' column in the same table, because of the missing 'company_admin_id' constraint. Now if it is null, it is at least possible to contact.
--=============================================


CREATE TABLE Companies
(
 "id"         SERIAL,
 company_name varchar(50) NOT NULL,
 CONSTRAINT PK_5 PRIMARY KEY ( "id" )
);


CREATE TABLE Accounts
(
 "id"            SERIAL,
 username        varchar(50) NOT NULL,
 password_hash   varchar(100) NOT NULL,
 email_account   varchar(50) NOT NULL,
 validated       boolean DEFAULT FALSE,
 profile_picture bytea NULL,
 rfid            int NULL,
 company_id      int NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_18 FOREIGN KEY ( company_id ) REFERENCES Companies ( "id" )
);

CREATE INDEX FK_18 ON Accounts
(
 company_id
);


CREATE TABLE Platform_admins
(
 "id"       SERIAL,
 account_id int NOT NULL,
 CONSTRAINT PK_2 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_1 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" )
);

CREATE INDEX FK_1 ON Platform_admins
(
 account_id
);


CREATE TABLE Buildings
(
 "id"              SERIAL,
 building_name     varchar(50) NOT NULL,
 building_location varchar(50) NOT NULL,
 CONSTRAINT PK_3 PRIMARY KEY ( "id" )
);


CREATE TABLE Building_admins
(
 "id"        SERIAL,
 account_id  int NOT NULL,
 building_id int NOT NULL,
 CONSTRAINT PK_4 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_2 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" ),
 CONSTRAINT FK_3 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" )
);

-- Didn't test, should work.
-- Pameten človek bi to naredu kar v CREATE stavku. Bom ko pridem do moje dev machine.
ALTER TABLE Building_admins
ADD CONSTRAINT unique_account_building
UNIQUE (account_id, building_id);

CREATE INDEX FK_2 ON Building_admins
(
 account_id
);

CREATE INDEX FK_3 ON Building_admins
(
 building_id
);


CREATE TABLE Company_admins
(
 "id"       SERIAL,
 account_id int NOT NULL,
 company_id int NOT NULL,
 CONSTRAINT PK_6 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_4 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" ),
 CONSTRAINT FK_5 FOREIGN KEY ( company_id ) REFERENCES Companies ( "id" )
);

-- Didn't test, should work.
-- Pameten človek bi to naredu kar v CREATE stavku. Bom ko pridem do moje dev machine.
ALTER TABLE Company_admins
ADD CONSTRAINT unique_account_company
UNIQUE (account_id, company_id);

CREATE INDEX FK_4 ON Company_admins
(
 account_id
);

CREATE INDEX FK_5 ON Company_admins
(
 company_id
);


CREATE TABLE "Building-Company"
(
 "id"        SERIAL,
 building_id int NOT NULL,
 company_id  int NOT NULL,
 CONSTRAINT PK_7 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_6 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" ),
 CONSTRAINT FK_7 FOREIGN KEY ( company_id ) REFERENCES Companies ( "id" )
);

-- Didn't test, should work.
-- Pameten človek bi to naredu kar v CREATE stavku. Bom ko pridem do moje dev machine.
ALTER TABLE "Building-Company"
ADD CONSTRAINT unique_building_company
UNIQUE (building_id, company_id);

CREATE INDEX FK_6 ON "Building-Company"
(
 building_id
);

CREATE INDEX FK_7 ON "Building-Company"
(
 company_id
);


CREATE TABLE Building_accesses
(
 "id"            SERIAL,
 account_id      int NOT NULL,
 building_id     int NULL,
 company_admin_id   int NULL,
 email_account   varchar(50) NULL,
 expiration_date date NULL,
 CONSTRAINT PK_8 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_8 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" ),
 CONSTRAINT FK_9 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" ),
);

CREATE INDEX FK_8 ON Building_accesses
(
 account_id
);

CREATE INDEX FK_9 ON Building_accesses
(
 building_id
);


CREATE TABLE Charging_types
(
 "id" SERIAL,
 type varchar(50) NOT NULL,
 CONSTRAINT PK_9 PRIMARY KEY ( "id" )
);


CREATE TABLE Charging_stations
(
 "id"             SERIAL,
 charging_type_id int NOT NULL,
 building_id      int NOT NULL,
 company_id       int NULL,
 name             varchar(50) NULL,
 CONSTRAINT PK_10 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_11 FOREIGN KEY ( charging_type_id ) REFERENCES Charging_types ( "id" ),
 CONSTRAINT FK_12 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" ),
 CONSTRAINT FK_16 FOREIGN KEY ( company_id ) REFERENCES Companies ( "id" )
);

CREATE INDEX FK_11 ON Charging_stations
(
 charging_type_id
);

CREATE INDEX FK_12 ON Charging_stations
(
 building_id
);

CREATE INDEX FK_16 ON Charging_stations
(
 company_id
);


CREATE TABLE Reservations
(
 "id"                SERIAL,
 account_id          int NOT NULL,
 charging_station_id int NULL,
 charging_type_id    int NULL,
 creation_time       date NOT NULL,
 charging_time       int NOT NULL,
 desired_from        date NOT NULL,
 desired_to          date NOT NULL,
 allocated_from      date NULL,
 allocated_to        date NULL,
 CONSTRAINT PK_11 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_13 FOREIGN KEY ( charging_station_id ) REFERENCES Charging_stations ( "id" ),
 CONSTRAINT FK_14 FOREIGN KEY ( charging_type_id ) REFERENCES Charging_types ( "id" ),
 CONSTRAINT FK_15 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" )
);

CREATE INDEX FK_13 ON Reservations
(
 charging_station_id
);

CREATE INDEX FK_14 ON Reservations
(
 charging_type_id
);

CREATE INDEX FK_15 ON Reservations
(
 account_id
);

CREATE TABLE Sessions
(
 "id"            SERIAL,
 account_id      int NOT NULL,
 session_secret varchar(100) NOT NULL,
 expiration_time timestamp NOT NULL,
 CONSTRAINT PK_12 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_17 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" )
);

CREATE INDEX FK_17 ON Sessions
(
 account_id
);

CREATE TABLE Registration_secrets
(
 "id"            SERIAL,
 account_id      int NOT NULL,
 registration_secret varchar(100) NOT NULL,
 expiration_time timestamp NOT NULL,
 CONSTRAINT PK_13 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_19 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" )
);

CREATE INDEX FK_19 ON Registration_secrets
(
 account_id
);
