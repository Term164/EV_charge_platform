# EV_PLATFORM BACKEND

This is a quick guide on how to configure the backend for development and everything else you need to know.

## PROJECT OVERVIEW

Backend
   |
   |------- src
   |         |
   |         |------ models
   |         |------ routes
   |         |------ utils
   |         |------ app.ts
   |         |------ index.ts


### MODELS

This folder contains all the models of different requests that can be made.

### ROUTES

This folder contains files for each parent route.


- auth.ts
- building.ts
- company.ts
- reservation.ts
- station.ts
- user.ts


### UTILS
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



## DEPENDENCIES

1. Logger [ts-log](https://tslog.js.org/#/)
2. Password hasher [bcrypt](https://www.npmjs.com/package/bcrypt)
3. [Express](https://expressjs.com/)