//install express, sqlite3, sqlite, crypto, multer
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const multer = require('multer');
const upload = multer();
//removed crypto as it is built in

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(upload.none())

export { express, app, sqlite3, sqlite, multer, upload };
