const functions = require('firebase-functions');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const cors = require('cors');
const { guaravarora7gmailcom } = require('./admins');

var confi = require('../.runtimeconfig');
if(Object.keys(functions.config()).length){
	confi = functions.config();
 }

const emailPassword = confi.technoemail.password;
const emailClientId = confi.technoemail.clientid;
const emailRefreshToken = confi.technoemail.refreshtoken;
const emailClientSecret = confi.technoemail.clientsecret;

admin.initializeApp();

// import the rotues
const userRoutes = require('./routes/user');
const eventsRoutes = require('./routes/events');
const dataRoutes = require('./routes/data');
const adminRoutes = require('./routes/admin');

// express
const app = express();

// middlewares
app.use(bodyParser.urlencoded({extended:false}));

// routes
app.use(cors({origin: true}));

// use custom routes
app.use(userRoutes);
app.use(eventsRoutes);
app.use(dataRoutes);
app.use(adminRoutes);

// send swagger
app.get('/swaggerjson',(req,res)=>{
    res.send(swaggerDocument);
});

// serve public
app.use(express.static(__dirname + "/swagger"));

// defalut route
app.use('/', (req, res) => {
	let data = {};
	let success = false;
	let message = "connected to server";
	let anotherMessage = "C'mon we created so many routes, use them!!";

	res.status(404).json({
		success:success,
		message:message,
		anotherMessage:anotherMessage
	});
})

// registeredEvents
// {
// 	managerial: ["a", "b"],
// 	programming: ["a", "b"]
// }
// register user for a events
function eventRegister(request, response)
{
	let eventName = request.body.eventName;
	let eventCategory = request.body.eventCategory;
	let email = request.body.email;
	var emailArray = request.body.email.split(",");
    var finalEmail = emailArray[0];
	for (let i = 1; i < emailArray.length; i++) {
		finalEmail += "." + emailArray[i];
	  }
	  
	if(eventName === undefined || eventCategory === undefined) {
		return response.status(400).json({
			success: false,
			message: `Invalid Parameters.\n Usage: eventName=event&eventCategory=category`
		});
	}

	// get previsouly registered events
	db.child(users + "/" + email + "/" + registeredEvents).once('value')
	.then((snapshot) => {
		let registeredEvent = snapshot.val();
		if(registeredEvent === undefined || registeredEvent === null) {
			registeredEvent = {};
		}

		// if not registred any events in that category
		if(registeredEvent[eventCategory] === undefined) {
			// create array fro category
			registeredEvent[eventCategory] = new Array();
			// push event into that category
			registeredEvent[eventCategory].push(eventName);
		} else {
			// if category already exists
			// push event to that category

			// if event already registered
			if(registeredEvent[eventCategory].indexOf(eventName) === -1) {
				registeredEvent[eventCategory].push(eventName);
			} else {
				return response.send({
					success: false,
					message: `already registered for ${eventName}`
				})
			}
		}

		// update user registered events
		db.child(users + "/" + email).update({
			[registeredEvents]: registeredEvent
		})
		.then(() => {
			let transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
				  type: 'OAuth2',
				  user: "noreplytechnobyte@gmail.com",
				  pass: emailPassword,
				  clientId: emailClientId,
				  clientSecret: emailClientSecret,
				  refreshToken: emailRefreshToken
				}
			  });
			let mailOptions = {
				from: "noreplytechnobyte@gmail.com",
				to: finalEmail,
				subject: 'Techno event',
				text: "Successfully registered for " + eventName
			  };
			  transporter.sendMail(mailOptions, function(err, data) {
				if (err) {
				  console.log("Error " + err);
				} else {
				  console.log("Email sent successfully");
				}
			  });
			return response.json({
				success:true,
				status: `Successfully registered for ${eventName}`
			});
		})
		.catch(() => {
			return response.json({
				success:false,
				message: "could not register!",
				error: err
			});
		});

		return;
	})
	.catch(() => {
		return response.json({
			success:false,
			message: "could not fetch user registered events",
			error: err
		});
	});
}

exports.api = functions.https.onRequest(app);
