const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MySQL connection
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     database: 'flames',
//     password: 'sivamani@524323'
// });



// railway databse connection

// const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

connection.connect((err) => {
  if (err) console.log("DB connection failed:", err);
  else console.log("DB connected successfully");
});
// upto railway connection

app.get("/", (req, res) => {
    res.render('home.ejs');
});

// POST route: handle form submission
app.post('/user', (req, res) => {
    let { name, FrdName } = req.body;

    const realname = name.trim();
    const ActalFrdname = FrdName.trim();

    // Remove common letters
    let nameArr = realname.split('');
    let frdArr = ActalFrdname.split('');

    for (let i = 0; i < nameArr.length; i++) {
        for (let j = 0; j < frdArr.length; j++) {
            if (nameArr[i] === frdArr[j]) {
                nameArr.splice(i, 1);
                frdArr.splice(j, 1);
                i--;
                j--;
                break;
            }
        }
    }

    const n = nameArr.length + frdArr.length;

    // FLAMES logic
    let arr = ['F','L','A','M','E','S'];
    let tempArr = [...arr];

    while (tempArr.length > 1) {
        let index = (n - 1) % tempArr.length;
        tempArr.splice(index, 1);
        tempArr = tempArr.splice(index).concat(tempArr.splice(0, index));
    }

    let user = tempArr[0];
    let relationship;

    switch(user) {
        case 'F': relationship = 'Friends'; break;
        case 'L': relationship = 'Lovers'; break;
        case 'M': relationship = 'Marriage'; break;
        case 'E': relationship = 'Enemies'; break;
        case 'A': relationship = 'Affection'; break;
        case 'S': relationship = 'Siblings'; break;
        default: relationship = 'Unknown';
    }

    // Insert into database
    const q = 'INSERT INTO users(name, FrdName, relationship) VALUES (?, ?, ?)';
    connection.query(q, [realname, ActalFrdname, relationship], (err, result) => {
        if (err) {
            console.log(err.message);
            return res.send("Database error");
        }

        // REDIRECT to result page with inserted row id
        res.redirect(`/result/${result.insertId}`);
    });
});

// GET route: display result page
app.get("/result/:id", (req, res) => {
    const id = req.params.id;

    const q = "SELECT * FROM users WHERE Id = ?";
    connection.query(q, [id], (err, rows) => {
        if (err) return res.send("Database error");

        if (rows.length > 0) {
            const user = rows[0];
            res.render('ans.ejs', {
                realname: user.name,
                ActalFrdname: user.FrdName,
                relationship: user.relationship
            });
        } else {
            res.send("Record not found");
        }
    });
});

app.listen(PORT,'0.0.0.0', () => {
    console.log('Server running successfully on port', PORT);
});
