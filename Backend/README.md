# EV_PLATFORM BACKEND

This is a quick guide on how to configure the backend for development and everything else you need to know.

## TASK LIST

### Main tasks
- :white_check_mark: Define all API route groups [@Term164](https://github.com/Term164)
- :stop_sign: Create swagger page for API (Too complex for current scope) [@Term164](https://github.com/Term164)
- :white_check_mark: Create inital SQL script and define SQL queries [@tadejsivic](https://github.com/tadejsivic)
- :white_check_mark: Finish auth route API calls and basic unit tests  [@Term164](https://github.com/Term164)
- :white_check_mark: Finish user route API calls and basic unit tests  [@Term164](https://github.com/Term164)
- :white_check_mark: company route API calls and basic unit tests  [@tadejsivic](https://github.com/tadejsivic)
- :white_check_mark: building route API calls and basic unit tests  [@tadejsivic](https://github.com/tadejsivic)
- :white_check_mark: Finish station route API calls and basic unit tests  [@tadejsivic](https://github.com/tadejsivic)
- :construction: Finish reservation route API calls and basic unit tests  [@tadejsivic](https://github.com/tadejsivic) [@Term164](https://github.com/Term164)
- :white_check_mark: Integrate Etrel charging point simulator [@tadejsivic](https://github.com/tadejsivic) [@Term164](https://github.com/Term164)

### Subtasks
> **ℹ️ Note**
>
> if you feel like a task is too big you can make subtasks here

### Task list legend
- :white_check_mark: - Task completed successfully
- :construction: - Task In progress
- :stop_sign: - Failed to complete task

## PROJECT OVERVIEW

<pre>
📦Backend
 ┣ 📂sql
 ┃ ┣ 📜initial_script.sql
 ┃ ┣ 📜query.sql
 ┃ ┣ 📜procedures.sql
 ┃ ┗ 📜seed_script.sql
 ┣ 📂src
 ┃ ┣ 📂models
 ┃ ┃ ┣ 📜databaseModels.ts
 ┃ ┃ ┣ 📜modelParser.ts
 ┃ ┃ ┣ 📜responseModels.ts
 ┃ ┃ ┗ 📜requestModels.ts
 ┃ ┣ 📂routes
 ┃ ┃ ┣ 📜auth.ts
 ┃ ┃ ┣ 📜building.ts
 ┃ ┃ ┣ 📜company.ts
 ┃ ┃ ┣ 📜dev.ts
 ┃ ┃ ┣ 📜reservation.ts
 ┃ ┃ ┣ 📜station.ts
 ┃ ┃ ┗ 📜user.ts
 ┃ ┣ 📂services
 ┃ ┃ ┣ 📜authService.ts
 ┃ ┃ ┣ 📜assignAdminService.ts
 ┃ ┃ ┣ 📜assignEmployeeService.ts
 ┃ ┃ ┣ 📜authService.ts
 ┃ ┃ ┣ 📜buildingService.ts
 ┃ ┃ ┣ 📜companyService.ts
 ┃ ┃ ┣ 📜userService.ts
 ┃ ┃ ┣ 📜chargingStationService.ts
 ┃ ┃ ┣ 📜chargingConnectorService.ts
 ┃ ┃ ┣ 📜chargingTypeService.ts
 ┃ ┃ ┗ 📜register.ts
 ┃ ┣ 📂tests
 ┃ ┃ ┣ 📜auth_service.test.ts
 ┃ ┃ ┣ 📜helper.ts
 ┃ ┃ ┣ 📜setup.ts
 ┃ ┃ ┣ 📜teardown.ts
 ┃ ┃ ┣ 📜assignAdmin_service.test.ts
 ┃ ┃ ┣ 📜assignEmployeeService.test.ts
 ┃ ┃ ┣ 📜buildingService.test.ts
 ┃ ┃ ┣ 📜companyService.test.ts
 ┃ ┃ ┣ 📜chargingStationService.test.ts
 ┃ ┃ ┣ 📜chargingConnectorService.test.ts
 ┃ ┃ ┣ 📜chargingTypeService.test.ts
 ┃ ┃ ┣ 📜auth_service.test.ts
 ┃ ┃ ┣ 📜register_service.test.ts
 ┃ ┃ ┣ 📜userService.test.ts
 ┃ ┃ ┗ 📜sessionID_middleware.test.ts
 ┃ ┣ 📂utils
 ┃ ┃ ┣ 📜config.ts
 ┃ ┃ ┣ 📜database.ts
 ┃ ┃ ┣ 📜logger.ts
 ┃ ┃ ┣ 📜SQLStatementManager.ts
 ┃ ┃ ┗ 📜middleware.ts
 ┃ ┣ 📜app.ts
 ┃ ┗ 📜index.ts
 ┣ 📜.eslintignore
 ┣ 📜.eslintrc.json
 ┣ 📜jest.config.js
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜README.md
 ┗ 📜tsconfig.json
</pre>

### MODELS

This folder contains all the data models that are used inside the platform.

For now only 2 types of models have been defined.

1. Request models - These are models of API request and response objects
2. Database models - These are models of the different types of data inisde the database
   
> **ℹ️ Note**
>
> There is also a parser class that has to be called when the data is recieved to check that all types match the model.

### ROUTES

This folder contains files for each parent route.

- auth.ts
- building.ts
- company.ts
- reservation.ts
- station.ts
- user.ts
- dev.ts

All API calls are defined in the [documentation](/Documentation.md#API) file in the root directory.

### SERVICES

Every route group should in teory also have a service file, but that can change depending on the complexity of the request. Some requests are more complex than a simple SQL query and for them a separate Service file should be created. Services should be split into logical groups and then used according to the request.

### UTILS
Under the utils directory you can find a couple of important files that contain frequently called functions and general helper functions.

- config.ts - Reads the enviromental variables and checks that they are properly assigned
- database.ts - Establishes and closes connection to the server, also exposes the connection class which is used to make queries
- logger.ts - The definition of the internal logger used for the whole project
- middleware.ts - Defines the middleware that is run prior or after a request is parsed.


### TESTS

Under the tests folder all unit tests for the backend are present.

All test files must end with the .test.ts prefix

If there are any helper functions that are used during testing they should also be written here in the helper.ts file

### APP and INDEX

This is the starting point of the backend application. It starts in the index file and imports the app.
It connects to the database and then starts the app on a port specified in the enviromental variables.

The app then prepares all the routes with express and loads the necessary middleware, after that it is ready to serve requests.

### LIST OF ERROR CODES

1. Error code 1: unknown foreign key constraint when assigning building admins (should not happen).
2. Error code 2: unknown foreign key constraint when assigning company admins (should not happen).
3. Error code 3: unknown foreign key constraint when assigning user to building (should not happen).
4. Error code 4: unknown foreign key constraint when assigning employee to company (should not happen).

## SETUP DEV ENVIRONMENT

1. Clone the repository
2. Download and install [Node.js](https://nodejs.org/en)
3. Run `npm install`
4. Ask for the .env file from a secure channel

## BUILD AND RUN

To build the project run `npm run build ./tsconfig.json`. After building the project you can run it with `npm start`.

For different builds different tsconfig files should be used (production, development, ...).

### DEV MODE
You can also run the project in dev mode. This will make the project recompile as soon as it detects any changes made to the code.

`npm run dev`

### LINTER

A linter is currently used to enforce the same code style across the entire codebase. You can check the rules inside the [.eslintrc.json](/Backend/.eslintrc.json) file.

## UNIT TESTS
Unit tests are run using jest. They can be run in the terminal with the command `npm run test`.

> **⚠️ Important**
>
> the command `npm run test` will run all .test.ts files inside the test folder with the option **runInBand** that executes the files sequentially.


If you want to run a single test file you can do so with the following command
`npm run test -- NameOfFile`
For example if you want to run only the auth service unit tests you would write this
`npm run test -- auth_service.test.ts`

## DEPENDENCIES

> **⚠️ Important**
>
> If you are importing dependencies make sure you also import their types so the IDE will be able to process the correct method types. Usualy the types are named after the package (@types/node)


Example: `npm install node @types/node`

1. Logger: [ts-log](https://tslog.js.org/#/)
2. Password hasher: [bcrypt](https://www.npmjs.com/package/bcrypt)
3. Http server: [Express](https://expressjs.com/)
4. Unit tests: [jest](https://jestjs.io/docs/getting-started)
5. cron jobs: [node-cron](https://www.npmjs.com/package/node-cron)
6. ocpp server: [ocpp-ts](https://www.npmjs.com/package/ocpp-ts)
7. postgresql connection: [postgresql-client](https://www.npmjs.com/package/postgresql-client)
8. 

## REST API Usage

### Basic successful response object looks like this:
```json
{
    "status": 200,  // status code 
    "message": "Login Successful", // human message
    "error": null,  // error message
    "data": {       // actual data, contains anything and everything
        ...
    }
}
```
#### `data` object has two possible formats:
```json
//! For single object return, the values are returned normally
"data": {
    "sessionID": "650af4b53faa92193fdfcc631d82b701"
}
// One might access this using `response.data.sessionID`

//! For multiple objects returned, an array of objects called "Result" is returned
"data": {
    "Result": [
        {
            "buildingName": "TEHNOLOŠKI PARK - STAVBA G",
        },
        {
            "buildingName": "A1 poslovna stavba",
        }
    ]
}
// One might access this using `response.data.Result[i].buildingName`
```


### Basic fail response object looks like this:
```json
// Only in dev mode will the detailed error messages be returned
{
    "status": 400,  // status code
    "message": "The username/email or password is incorrect", // human message
    "error": "User does not exist.",    // error message, detailed or actual error
    "data": null    // data, usually null for error
}
```

### Request and response objects
These can all be deducted from requestModels.ts and by comparing the functions that the API calls.

However here are some objects for easier working with some APIs.

Note that ALL request objects have a variable called **sessionID**, with a value of a received session secret when login was performed. SessionID is skipped here.

These are all **examples**, for actual types do visit the _requesModels.ts_.

(*Click to expand*)

<details>
<summary><i>Get Buildings response object</i></summary>
Some get requests look something like this (for companies, charging types).
For actual types visit the <i>requesModels.ts</i>.

```json
{
    "buildingID": 1,
    "buildingName": "TEHNOLOŠKI PARK - STAVBA G",
    "buildingLocation": "Večna pot 150",
    "buildingLongitude": 46.54642,
    "buildingLatitude": 15.423567
}
```
</details>

<details>
<summary><i>Edit Building request object</i></summary>
Patch requests look something like this (for companies, charging types, ...).
Only include the attributes you wish to change.

```json
{   // Since this is a PATCH, use only the needed variables
    "buildingID": 8,
    "newBuildingName": "dummy_version_2",
    "newBuildingLocation": "location_version_2",
    "newBuildingLongitude": 46.1
}

{   // This is a valid request, we are only changing the name. 
    "buildingID": 8,
    "newBuildingName": "hello",
}
// Remember, setting the variable to null does not work when we don't want to change that attribute. Do not include the variable at all.
```
</details>

<details>
<summary><i>Create Charging Station request object</i></summary>
Creating a charging station is a bit special, since a station (besides having a name and belonging to a building) has any number of connectors (which themself have types).
When creating a station, pass in the array of connectors, which each have a type,serial number and power output (in Watts).

```json
{
    "buildingID": 1,
    "stationName": "my-station-test", // Stations names must be unique alltogether
    "chargingConnectors": [
        {
            "chargingTypeID":1,
            "serialNumber": 1,
            "powerOutput": 25
        },
        {
            "chargingTypeID":1,
            "serialNumber": 2,   // Serial numbers must be unique to a station
            "powerOutput": 25
        },
        {
            "chargingTypeID":1,
            "serialNumber": 3,
            "powerOutput": 25
        }
    ]
}
```
</details>

<details>
<summary><i>Get Charging Stations response object</i></summary>
Getting back a charging station returns a lot of information (hence the response model object was created).

Returning IDs here for everything is important, since these are all needed for further manipulation with anything (deleting, editing, searching further).

```json
{
    "chargingStationID": 4,             // station id
    "chargingStationName": "Počasna 1",
    "chargingConnectors": [             // array of connectors,
    {
        "chargingConnectorID": 4,       // each one has id, serial num and power
        "chargingConnectorSerialNumber": 1,
        "chargingConnectorPowerOutput": 50,
        "chargingType": {               // and detailed charging type object
            "chargingTypeID": 3,
            "chargingType": "15W"
        }
    },
    {
        "chargingConnectorID": 5,
        "chargingConnectorSerialNumber": 2,
        "chargingConnectorPowerOutput": 60,
        "chargingType": {
            "chargingTypeID": 3,
            "chargingType": "15W"
        }
    }
    ],
    "building": { // details about a building, null if only this building was searched
        "buildingID": 3,
        "buildingName": "A1 Maribor",
        "buildingLocation": "Mariborska cesta",
    },
    "company": null     // details about a company, if it owns this station
}
```
</details>

<details>
<summary><i>Create charging connector request object</i></summary>
This is to be used when adding a connector to a station.
A connector alone doesn't exist.

This is a so called backup method, not really to be used regularly (since when creating stations you add all connectors).

If more than one connectors need to be added, request the API for each one.

```json
{   // You will receive errors if any of these IDs are incorrect
    "stationID": 7,
    "chargingConnector":
    {
        "chargingTypeID": 1,
        "serialNumber": 2,   // Or if a serial number is in use on this station
        "powerOutput": 75
    }
}
```
</details>

### Delete methods
Do note that delete methods (usually) require only one argument, that being the ID of an entity.

There are many ways of sending a single number via REST API, like in headers, or in a query parameter.
We are using request object, so an object will just have a single ID inside.
There will always be a request object sent with at least a session ID, hence we can freely use the object.

```json
{   // Example: /api/v1/.../delete/building
    "sessionID": "{{session}}", // Always present, in examples above it was skipped
    "buildingID": 7
}
```