var mongoose = require('mongoose');
var config = require('../config');
var jwt = require('jsonwebtoken');
var async = require('async');
var qs = require('querystring');
var chalk = require('chalk');

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://chan1di:chan123@ds251332.mlab.com:51332/attend';

var register = mongoose.model("user");

exports.login = function(req, res) {
    var receivedValues = req.body;
    if (JSON.stringify(receivedValues) === '{}' || receivedValues === undefined || receivedValues === null) {
        console.log(chalk.red("### Error Message: User Not available"));
        res.json({
            "code": 403,
            "status": "Error",
            "message": "User Not available!"
        });
        return;
    } else {
        var usercolumns = ["mail", "password"];
        for (var iter = 0; iter < usercolumns.length; iter++) {
            var columnName = usercolumns[iter];
            if (receivedValues[columnName] === undefined && (columnName === 'mail' || columnName === 'password')) {
                console.log(chalk.red(columnName, " field is undefined"));
                res.json({
                    "code": 403,
                    "status": "Error",
                    "message": columnName + " field is undefined"
                });
                return;
            }
        }
        var user = new register();
        user.mail = req.body.mail;
        user.password = req.body.password;

        register.findOne({
            'mail': req.body.mail
        }, function(err, userDetail) {
            if (userDetail !== null) {
                if (userDetail.validPassword(req.body.password)) {
                    var authToken = jwt.sign(userDetail, config.secret, {
                        expiresIn: 1440 * 60 * 30 // expires in 24 hours
                    });
                    var data = {
                        email: userDetail.mail,
                        address: userDetail.address,
                        status: "success"
                    };
                    res.json({
                        "code": 200,
                        "authToken": authToken,
                        "data": data
                    });
                } else {
                    console.log(chalk.red("### Error Message: Email or Password is Worng"));
                    res.json({
                        "code": 403,
                        "status": "Error",
                        "message": "Email or Password is Worng"
                    });
                }
            } else {
                console.log(chalk.red("### Error Message: Email or Password is Worng"));
                res.json({
                    "code": 403,
                    "status": "Error",
                    "message": "Email or Password is Worng"
                });
            }
        });
    }
};

exports.register = function(req, res) {
    console.log("working", req.body);
    MongoClient.connect(MONGO_URL, (err, db) => {
        if (err) {
            console.log(err);
        }
        console.log("connected successfully");
        let database = db.db('attend');
        if (req.body.action == "teacher") {
            database.collection('teaminfos').find()
                .toArray((err, results) => {
                    if (err) throw err;
                    results.forEach((value) => {
                        return res.json({
                            name: value.name,
                            description: value.description
                        });
                    });
                });
        }
    });
};