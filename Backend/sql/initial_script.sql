-- Prepared for PostgreSQL
-- Use the picture ER_diagram.png for reference
--
-- MEANT TO BE RUN ONCE
--
-- Naming convention for constraints is: {kind}_{table_name}_{column_name(s)}
-- Kinds of contstraints:
-- -> prm for primary key
-- -> frn for foreign key
-- -> ind for index
-- -> uni for unique constraint
--
--=============================================
-- V 3.2
-- -> Renames columns to allocated_connector_id (was charging_connector_id) and desired_charging_type_id (was just charging_type_id). This makes it much more clear of the intention.
-- -> Added columns desired_building_id and position_in_queue, both of which are needed for manipulating reservations, that are in queue (not final).
--=============================================

CREATE TABLE Companies
(
 "id"         SERIAL,
 company_name varchar(50) NOT NULL,
 CONSTRAINT prm_companies_id PRIMARY KEY ("id")
);


CREATE TABLE Accounts
(
 "id"            SERIAL,
 username        varchar(50) NOT NULL,
 password_hash   varchar(100) NOT NULL,
 email_account   varchar(50) NOT NULL,
 validated       boolean DEFAULT FALSE,
 profile_picture bytea NULL,
 rfid            varchar(50) NULL,
 company_id      int NULL,
 CONSTRAINT prm_accounts_id PRIMARY KEY ("id"),
 CONSTRAINT frn_accounts_company_id FOREIGN KEY (company_id) REFERENCES Companies ("id")
);

CREATE INDEX ind_accounts_company_id ON Accounts
(
  company_id
);


CREATE TABLE Platform_admins
(
 "id"       SERIAL,
 account_id int NOT NULL,
 CONSTRAINT prm_platform_admins_id PRIMARY KEY ("id"),
 CONSTRAINT frn_platform_admins_account_id FOREIGN KEY (account_id) REFERENCES Accounts ("id")
);

CREATE INDEX ind_platform_admins_account_id ON Platform_admins
(
  account_id
);


CREATE TABLE Buildings
(
 "id"              SERIAL,
 building_name     varchar(50) NOT NULL,
 building_location varchar(50) NOT NULL,
 longitude         REAL,
 latitude          REAL,
 CONSTRAINT prm_buildings_id PRIMARY KEY ("id")
);


CREATE TABLE Building_admins
(
 "id"        SERIAL,
 account_id  int NOT NULL,
 building_id int NOT NULL,
 CONSTRAINT prm_building_admins_id PRIMARY KEY ("id"),
 CONSTRAINT frn_building_admins_account_id FOREIGN KEY (account_id) REFERENCES Accounts ("id"),
 CONSTRAINT frn_building_admins_building_id FOREIGN KEY (building_id) REFERENCES Buildings ("id"),
 CONSTRAINT uni_building_admins_account_id_building_id UNIQUE (account_id, building_id)
);

CREATE INDEX ind_building_admins_account_id ON Building_admins
(
  account_id
);

CREATE INDEX ind_building_admins_building_id ON Building_admins
(
  building_id
);


CREATE TABLE Company_admins
(
 "id"       SERIAL,
 account_id int NOT NULL,
 company_id int NOT NULL,
 CONSTRAINT prm_company_admins_id PRIMARY KEY ("id"),
 CONSTRAINT frn_company_admins_account_id FOREIGN KEY (account_id) REFERENCES Accounts ("id"),
 CONSTRAINT frn_company_admins_company_id FOREIGN KEY (company_id) REFERENCES Companies ("id"),
 CONSTRAINT uni_company_admins_account_id_company_id UNIQUE (account_id, company_id)
);

CREATE INDEX ind_company_admins_account_id ON Company_admins
(
  account_id
);

CREATE INDEX ind_company_admins_company_id ON Company_admins
(
  company_id
);


CREATE TABLE "Building-Company"
(
 "id"        SERIAL,
 building_id int NOT NULL,
 company_id  int NOT NULL,
 CONSTRAINT prm_building_company_id PRIMARY KEY ("id"),
 CONSTRAINT frn_building_company_building_id FOREIGN KEY (building_id) REFERENCES Buildings ("id"),
 CONSTRAINT frn_building_company_company_id FOREIGN KEY (company_id) REFERENCES Companies ("id"),
 CONSTRAINT uni_building_company_building_id_company_id UNIQUE (building_id, company_id)
);

CREATE INDEX ind_building_company_building_id ON "Building-Company"
(
  building_id
);

CREATE INDEX ind_building_company_company_id ON "Building-Company"
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
 CONSTRAINT prm_building_accesses_id PRIMARY KEY ("id"),
 CONSTRAINT frn_building_accesses_account_id FOREIGN KEY (account_id) REFERENCES Accounts ("id"),
 CONSTRAINT frn_building_accesses_building_id FOREIGN KEY (building_id) REFERENCES Buildings ("id"),
 CONSTRAINT uni_building_accesses_account_id_building_id UNIQUE (account_id, building_id)
);

CREATE INDEX ind_building_accesses_account_id ON Building_accesses
(
  account_id
);

CREATE INDEX ind_building_accesses_building_id ON Building_accesses
(
  building_id
);


CREATE TABLE Charging_types
(
 "id" SERIAL,
 type varchar(50) NOT NULL,
 CONSTRAINT prm_charging_types_id PRIMARY KEY ("id")
);


CREATE TABLE Charging_stations
(
 "id"             SERIAL,
 building_id      int NOT NULL,
 company_id       int NULL,
 name             varchar(50) NULL,
 CONSTRAINT prm_charging_stations_id PRIMARY KEY ("id"),
 CONSTRAINT frn_charging_stations_building_id FOREIGN KEY (building_id) REFERENCES Buildings ("id"),
 CONSTRAINT frn_charging_stations_company_id FOREIGN KEY (company_id) REFERENCES Companies ("id"),
 CONSTRAINT uni_charging_stations_name UNIQUE (name)
);

CREATE INDEX ind_charging_stations_building_id ON Charging_stations
(
  building_id
);

CREATE INDEX ind_charging_stations_company_id ON Charging_stations
(
  company_id
);


CREATE TABLE Charging_connectors
(
  "id"          SERIAL,
  charging_station_id int NOT NULL,
  charging_type_id    int NOT NULL,
  serial_number       int NOT NULL,
  power_output        int,
  CONSTRAINT prm_charging_connectors_id PRIMARY KEY ("id"),
  CONSTRAINT frn_charging_connectors_charging_station_id FOREIGN KEY (charging_station_id) REFERENCES Charging_stations ("id"),
  CONSTRAINT frn_charging_connectors_charging_type_id FOREIGN KEY (charging_type_id) REFERENCES Charging_types ("id"),
  CONSTRAINT uni_charging_connectors_charging_station_id_serial_number UNIQUE (charging_station_id, serial_number)
);

CREATE INDEX ind_charging_connectors_charging_station_id ON Charging_connectors
(
  charging_station_id
);

CREATE INDEX ind_charging_connectors_charging_type_id ON Charging_connectors
(
  charging_type_id
);


CREATE TABLE Reservations
(
 "id"                SERIAL,
 account_id          int NOT NULL,
 allocated_connector_id int NULL,
 desired_charging_type_id int NULL,
 desired_building_id int NULL,
 creation_time       timestamptz NOT NULL,
 charging_time       int NOT NULL,
 desired_from        timestamptz NOT NULL,
 desired_to          timestamptz NOT NULL,
 allocated_from      timestamptz NULL,
 allocated_to        timestamptz NULL,
 position_in_queue   int NULL,
 CONSTRAINT prm_reservations_id PRIMARY KEY ("id"),
 CONSTRAINT frn_reservations_charging_connector_id FOREIGN KEY (allocated_connector_id) REFERENCES Charging_connectors ("id"),
 CONSTRAINT frn_reservations_charging_type_id FOREIGN KEY (desired_charging_type_id) REFERENCES Charging_types ("id"),
 CONSTRAINT frn_reservations_account_id FOREIGN KEY (account_id) REFERENCES Accounts ("id"),
 CONSTRAINT frn_reservations_building_id FOREIGN KEY (desired_building_id) REFERENCES Buildings ("id")
);

CREATE INDEX ind_reservations_charging_connector_id ON Reservations
(
  allocated_connector_id
);

CREATE INDEX ind_reservations_charging_type_id ON Reservations
(
  desired_charging_type_id
);

CREATE INDEX ind_reservations_account_id ON Reservations
(
  account_id
);

CREATE INDEX ind_reservations_building_id ON Reservations
(
  desired_building_id
);


CREATE TABLE Sessions
(
 "id"            SERIAL,
 account_id      int NOT NULL,
 session_secret varchar(100) NOT NULL,
 expiration_time timestamp NOT NULL,
 CONSTRAINT prm_sessions_id PRIMARY KEY ("id"),
 CONSTRAINT frn_sessions_account_id FOREIGN KEY (account_id) REFERENCES Accounts ("id")
);

CREATE INDEX ind_sessions_account_id ON Sessions
(
  account_id
);


CREATE TABLE Registration_secrets
(
 "id"            SERIAL,
 account_id      int NOT NULL,
 registration_secret varchar(100) NOT NULL,
 expiration_time timestamp NOT NULL,
 CONSTRAINT prm_registration_secrets_id PRIMARY KEY ("id"),
 CONSTRAINT frn_registration_secrets_account_id FOREIGN KEY (account_id) REFERENCES Accounts ("id")
);

CREATE INDEX ind_registration_secrets_account_id ON Registration_secrets
(
  account_id
);
