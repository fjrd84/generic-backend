[![Build Status](https://travis-ci.org/fjrd84/generic-backend.svg?branch=master)](https://travis-ci.org/fjrd84/generic-backend) [![Coverage Status](https://coveralls.io/repos/github/fjrd84/generic-backend/badge.svg?branch=master)](https://coveralls.io/github/fjrd84/generic-backend?branch=master)

# NodeJS Backend with Authentication

Express/NodeJS REST API server designed to work as a backend for its Angular 2 based [generic-frontend](https://github.com/fjrd84/generic-frontend) counterpart.

The main features so far are:

- User login using different strategies (initially based on [a scotch.io tutorial](https://scotch.io/tutorials/easy-node-authentication-setup-and-local)).
  * Local (email/password)
  * Google (oAuth)
  * Twitter (oAuth)
  * Facebook (oAuth)
- Link and unlink user accounts to the aforementioned authentication strategies.



## Instructions

- Install packages: `npm install`
- Set your own database configuration on config/database.js
- Copy the file `config/auth.js.example` to `config/auth.js` and use your own keys
- Launch the mongodb on the directory `./db`: `npm run startdb`
- Launch this project: `npm run start`
- Open `http://localhost:3200` in your browser
