-- Generated for PostgreSQL
-- Use the picture ER_diagram.png for reference
-- 
-- Near final version, could change-- 
-- V 1.0
-- -> Wrong definitons for ID primary keys
-- -> Wrong PK, FK numbers
--=============================================
-- V 2.0

CREATE TABLE Accounts
(
 "id"            SERIAL,
 username        varchar(50) NOT NULL,
 password_hash   varchar(100) NOT NULL,
 password_salt   varchar(50) NOT NULL,
 email_account   varchar(50) NOT NULL,
 profile_picture bytea NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" )
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

CREATE INDEX FK_2 ON Building_admins
(
 account_id
);

CREATE INDEX FK_3 ON Building_admins
(
 building_id
);


CREATE TABLE Companies
(
 "id"         SERIAL,
 company_name varchar(50) NOT NULL,
 CONSTRAINT PK_5 PRIMARY KEY ( "id" )
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

CREATE INDEX FK_6 ON "Building-Company"
(
 building_id
);

CREATE INDEX FK_7 ON "Building-Company"
(
 company_id
);


CREATE TABLE Consumers
(
 "id"            SERIAL,
 account_id      int NOT NULL,
 building_id     int NULL,
 company_id      int NULL,
 expiration_date date NULL,
 rfid            int NULL,
 CONSTRAINT PK_8 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_8 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" ),
 CONSTRAINT FK_9 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" ),
 CONSTRAINT FK_10 FOREIGN KEY ( company_id ) REFERENCES Companies ( "id" )
);

CREATE INDEX FK_8 ON Consumers
(
 account_id
);

CREATE INDEX FK_9 ON Consumers
(
 building_id
);

CREATE INDEX FK_10 ON Consumers
(
 company_id
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
 name             varchar(50) NULL,
 CONSTRAINT PK_10 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_11 FOREIGN KEY ( charging_type_id ) REFERENCES Charging_types ( "id" ),
 CONSTRAINT FK_12 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" )
);

CREATE INDEX FK_11 ON Charging_stations
(
 charging_type_id
);

CREATE INDEX FK_12 ON Charging_stations
(
 building_id
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

