# NodeJS Backend with Authentication

This project lets a user authenticate locally, or with Facebook, Twitter and Google by using oAuth, by 
means of the passport module.

Once the user is authenticated with one of the aforementioned strategies, he or she can link his profile to 
his other profiles.

It all started with [a scotch.io tutorial](https://scotch.io/tutorials/easy-node-authentication-setup-and-local).

## Instructions

- Install packages: `npm install`
- Set your own database configuration on config/database.js
- Copy the file `config/auth.js.example` to `config/auth.js` and use your own keys
- Launch the mongodb on the directory `./db`: `npm run startdb`
- Launch this project: `npm run start`
- Open `http://localhost:3200` in your browser
