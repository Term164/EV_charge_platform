-- Generated for PostgreSQL
-- Use the picture ER_diagram.png for reference
-- 
-- Near final version, could change
-- 
-- V 1.0
--=============================================

CREATE TABLE Accounts
(
 "id"              int NOT NULL,
 username        varchar(50) NOT NULL,
 password_hash   varchar(100) NOT NULL,
 password_salt   varchar(50) NOT NULL,
 email_account   varchar(50) NOT NULL,
 profile_picture bytea NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" )
);


CREATE TABLE Platform_admins
(
 "id"         int NOT NULL,
 account_id int NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_15 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" )
);

CREATE INDEX FK_1 ON Platform_admins
(
 account_id
);


CREATE TABLE Buildings
(
 "id"                int NOT NULL,
 building_name     varchar(50) NOT NULL,
 building_location varchar(50) NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" )
);


CREATE TABLE Building_admins
(
 "id"          int NOT NULL,
 account_id  int NOT NULL,
 building_id int NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_3 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" ),
 CONSTRAINT FK_4 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" )
);

CREATE INDEX FK_1 ON Building_admins
(
 account_id
);

CREATE INDEX FK_2 ON Building_admins
(
 building_id
);


CREATE TABLE Companies
(
 "id"           int NOT NULL,
 company_name varchar(50) NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" )
);


CREATE TABLE Company_admins
(
 "id"         int NOT NULL,
 account_id int NOT NULL,
 company_id int NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_5 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" ),
 CONSTRAINT FK_6 FOREIGN KEY ( company_id ) REFERENCES Companies ( "id" )
);

CREATE INDEX FK_1 ON Company_admins
(
 account_id
);

CREATE INDEX FK_2 ON Company_admins
(
 company_id
);


CREATE TABLE "Building-Company"
(
 "id"          int NOT NULL,
 building_id int NOT NULL,
 company_id  int NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_10 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" ),
 CONSTRAINT FK_11 FOREIGN KEY ( company_id ) REFERENCES Companies ( "id" )
);

CREATE INDEX FK_1 ON "Building-Company"
(
 building_id
);

CREATE INDEX FK_2 ON "Building-Company"
(
 company_id
);


CREATE TABLE Consumers
(
 "id"              int NOT NULL,
 account_id      int NOT NULL,
 building_id     int NULL,
 company_id      int NULL,
 expiration_date date NULL,
 rfid            int NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_7 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" ),
 CONSTRAINT FK_8 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" ),
 CONSTRAINT FK_9 FOREIGN KEY ( company_id ) REFERENCES Companies ( "id" )
);

CREATE INDEX FK_1 ON Consumers
(
 account_id
);

CREATE INDEX FK_2 ON Consumers
(
 building_id
);

CREATE INDEX FK_3 ON Consumers
(
 company_id
);


CREATE TABLE Charging_types
(
 "id"   int NOT NULL,
 type varchar(50) NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" )
);


CREATE TABLE Charging_stations
(
 "id"               int NOT NULL,
 charging_type_id int NOT NULL,
 building_id      int NOT NULL,
 name             varchar(50) NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_1 FOREIGN KEY ( charging_type_id ) REFERENCES Charging_types ( "id" ),
 CONSTRAINT FK_2 FOREIGN KEY ( building_id ) REFERENCES Buildings ( "id" )
);

CREATE INDEX FK_1 ON Charging_stations
(
 charging_type_id
);

CREATE INDEX FK_2 ON Charging_stations
(
 building_id
);


CREATE TABLE Reservations
(
 "id"                  int NOT NULL,
 account_id          int NOT NULL,
 charging_station_id int NULL,
 charging_type_id    int NULL,
 creation_time       date NOT NULL,
 charging_time       int NOT NULL,
 desired_from        date NOT NULL,
 desired_to          date NOT NULL,
 allocated_from      date NULL,
 allocated_to        date NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" ),
 CONSTRAINT FK_12 FOREIGN KEY ( charging_station_id ) REFERENCES Charging_stations ( "id" ),
 CONSTRAINT FK_13 FOREIGN KEY ( charging_type_id ) REFERENCES Charging_types ( "id" ),
 CONSTRAINT FK_14 FOREIGN KEY ( account_id ) REFERENCES Accounts ( "id" )
);

CREATE INDEX FK_1 ON Reservations
(
 charging_station_id
);

CREATE INDEX FK_2 ON Reservations
(
 charging_type_id
);

CREATE INDEX FK_3 ON Reservations
(
 account_id
);

