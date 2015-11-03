/*jslint node:true, es5:true, nomen: true*/

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    validator = require('validator'),
    mongo = require('mongodb').MongoClient,
    nodemailer = require('nodemailer'),
    loggly = require('loggly'),
    CORSFilter,
    server = process.env.URL,
    sserver = process.env.SURL,
    mongoLabURI,
    smtpTransport = require('nodemailer-smtp-transport'),
    transporter;

//Log
var client = loggly.createClient({
    token: process.env.LOGGLY_TOKEN,
    subdomain: "tileapp",
    tags: ['NodeJS'],
    json: true
});


//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + '/public'));

//Database
mongoLabURI = process.env.MONGOLAB_URI;


//Mail
transporter = nodemailer.createTransport(smtpTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
}));


//CORS
CORSFilter = function (req, res, next) {
    "use strict";
    
    if (req.header('Origin') === server || req.header('Origin') === sserver) {
        res.header('Access-Control-Allow-Origin', server);
        res.header('Access-Control-Allow-Methods', 'POST');
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type');
        next();
    } else {
        client.log('CORS error');
        res.send('KO');
    }
};



app.post('/insert_contact', CORSFilter, function (req, res) {
    "use strict";
    
    
    var name = validator.trim(validator.escape(req.body.name)),
        email = validator.trim(validator.escape(req.body.email)),
        msg = validator.trim(validator.escape(req.body.msg)),
        emailFlag = true,
        bdFlag = false;
    
    
    transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Contacto / Enquire',
        text: 'Agradecemos o seu contacto. Responderemos em breve.\n\n Thank you for your contact. We will reply very soon.\n\nArgila azulejos - Handmade in Portugal'
    });
    
    
    transporter.sendMail({
        from: email,
        to: process.env.EMAIL_USER,
        subject: 'Contact Received',
        text: 'Name: ' + name + '\nEmail: ' + email + '\nMsg:\n ' + msg
    }, function (err, info) {
        if (err) {
            emailFlag = false;
            client.log('Error sending mail to ' + process.env.EMAIL_USER);
        }
        
        mongo.connect(mongoLabURI, function (err, db) {

            if (err) {
                bdFlag = false;
                client.log('Error connecting to DB: ' + err);
                
                if (bdFlag || emailFlag) {
                    res.send('OK');
                } else {
                    res.send('KO');
                }
            } else {
                db.collection('contacts', function (er, collection) {
                    collection.insert({'name': name, 'email': email, 'message': msg}, {safe: true}, function (er, rs) {
                   
                        if (er) {
                            bdFlag = false;
                            client.log('Error inserting into DB:' + er);
                        } else {
                            bdFlag = true;
                        }

                        if (bdFlag || emailFlag) {
                            res.send('OK');
                        } else {
                            res.send('KO');
                        }

                        db.close();
                    });
                });
            }
        });
    });
    
});

client.log('Listening on port:' + process.env.PORT);
app.listen(process.env.PORT);
