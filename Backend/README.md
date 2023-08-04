# EV_PLATFORM BACKEND

This is a quick guide on how to configure the backend for development and everything else you need to know.

## TASK LIST

### Main tasks
- :white_check_mark: Define all API route groups [@Term164](https://github.com/Term164)
- :stop_sign: Create swagger page for API (Too complex for current scope) [@Term164](https://github.com/Term164)
- :white_check_mark: Create inital SQL script and define SQL queries [@tadejsivic](https://github.com/tadejsivic)
- :white_check_mark: Finish auth route API calls and basic unit tests  [@Term164](https://github.com/Term164)
- :construction: Finish user route API calls and basic unit tests  [@Term164](https://github.com/Term164)
-  Finish company route API calls and basic unit tests  [@tadejsivic](https://github.com/tadejsivic)
-  Finish building route API calls and basic unit tests  [@tadejsivic](https://github.com/tadejsivic)
-  Finish station route API calls and basic unit tests  [@tadejsivic](https://github.com/tadejsivic)
-  Finish reservation route API calls and basic unit tests  [@tadejsivic](https://github.com/tadejsivic) [@Term164](https://github.com/Term164)
-  Integrate Etrel charging point simulator [@tadejsivic](https://github.com/tadejsivic) [@Term164](https://github.com/Term164)

### Subtasks
[!NOTE] if you feel like a task is too big you can make subtasks here

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
 ┃ ┗ 📜seed_script.sql
 ┣ 📂src
 ┃ ┣ 📂models
 ┃ ┃ ┣ 📜databaseModels.ts
 ┃ ┃ ┣ 📜modelParser.ts
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
 ┃ ┃ ┗ 📜register.ts
 ┃ ┣ 📂tests
 ┃ ┃ ┣ 📜auth_service.test.ts
 ┃ ┃ ┣ 📜helper.ts
 ┃ ┃ ┣ 📜register_service.test.ts
 ┃ ┃ ┗ 📜sessionID_middleware.test.ts
 ┃ ┣ 📂utils
 ┃ ┃ ┣ 📜config.ts
 ┃ ┃ ┣ 📜database.ts
 ┃ ┃ ┣ 📜logger.ts
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

1. Request models - These are models of API requests and responses
2. Database models - These are models of the different types of data inisde the database

[!NOTE] There is also a parser class that has to be called when the data is recieved to check that all types match the model.

### ROUTES

This folder contains files for each parent route.

- auth.ts
- building.ts
- company.ts
- reservation.ts
- station.ts
- user.ts
- dev

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

[!IMPORTANT]
the command `npm run test` will run all .test.ts files inside the test folder with the option **runInBand** that executes the files sequentially.

[!NOTE]
If you want to run a single test file you can do so with the following command
`npm run test -- NameOfFile`
For example if you want to run only the auth service unit tests you would write this
`npm run test -- auth_service.test.ts`

## DEPENDENCIES

[!IMPORTANT] If you are importing dependencies make sure you also import their types so the IDE will be able to process the correct method types. Usualy the types are named after the package (@types/node)

Example: `npm install node @type/node`

1. Logger: [ts-log](https://tslog.js.org/#/)
2. Password hasher: [bcrypt](https://www.npmjs.com/package/bcrypt)
3. Http server: [Express](https://expressjs.com/)
4. Unit tests: [jest](https://jestjs.io/docs/getting-started)