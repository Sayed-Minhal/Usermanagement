// Define Application Server requirements
const app = require("express")()
const bodyParser = require("body-parser");
var cors = require('cors');
const axios = require("axios");
const { pick } = require("lodash");
const jsonexport = require("jsonexport");

// Configure request parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

// Enable CORS
var whitelist = ['http://localhost:3000']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

// User 
const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");

// Setup environment variables
require('dotenv').config();

const db = process.env.DB;
const un = process.env.USER;
const pw = process.env.PWD;
const ds = process.env.DATASET;
const uri = `mongodb+srv://${un}:${pw}@${db}.v9jhm.mongodb.net/${ds}?retryWrites=true&w=majority&journal=true&wtimeoutMS=10000`
const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }

// Third party User API 
const authToken = process.env.APITOKEN;
const apiURL = "https://gorest.co.in/public-api/users?page=1"
const apiHeader = {
    Authorization: `Bearer ${authToken}`
}


// Define database models/schemas
var User;

// Connect to MongoDB Server
const connect = async (error) => {
    await mongoose.connect(`${uri}?limit=100`, connectionOptions)
        .then((connection) => {
            console.log("Connected successfully to DB Server");
        }).catch(error => {
            console.log("Unable to connect to DB Server");
        }).finally(() => {
            User = mongoose.model("User", require("./schemas/User.js"));
        });
}

const initDB = async () => await connect();

app.get("/users/list", cors(corsOptions), (req, res, next) => {

    axios.get(apiURL, { apiHeader })
        .then(result => {
            const { data } = result.data;
            res.status(result.status).send(data);
        })
        .catch(error => res.status(500).send(error))
});

app.get("/users", (req, res, next) => {
    let dbUserIDList = [];
    let newUsers = [];

    User.find({}, (err, docs) => {
        if (err) {
            console.log("Error fetching Users from DB");
        }
        dbUserIDList = docs.map(user => pick(user, ["id"]));
    })
    axios.get(apiURL, { apiHeader })
        .then(result => {
            const { data } = result.data;

            if (dbUserIDList && dbUserIDList.length > 0) {
                newUsers = data.filter(user => dbUserIDList.find(dbuser => user.id == dbuser.id) === undefined);
            } else {
                newUsers = data
            }

            if (newUsers && newUsers.length > 0) {
                User.insertMany(newUsers, (err, docs) => {
                    if (err) {
                        console.log("Unable to insert data to DB");
                        return err;
                    }
                    console.log("Successfully written", docs.length, "records to DB");
                })
            }
            res.status(result.status).send(data);
        })
        .catch(error => res.status(500).send(error))
});

app.post("/users/update", (req, res, next) => {
    User.findOneAndUpdate({ id: req.body.id }, req.body, (err, doc) => {
        if (err) {
            console.log(err);
            res.status(500).send(err)
        }
        res.status(200).send(doc)
    })
})

app.post("/users/csv", (req, res, next) => {
    jsonexport(req.body, function (err, csv) {
        if (err) res.status(500).send(err);
        res.setHeader("content-disposition", "attachment; filename=data.csv");
        res.send(csv);
    });
})

app.listen(process.env.PORT || 8181, () => {
    console.log("USER service is available on port", (process.env.PORT || 8181))
    initDB();
})
