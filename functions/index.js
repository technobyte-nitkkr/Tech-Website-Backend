const functions = require('firebase-functions');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const isAuthenticated = require('./middlewares/auth');
const isAuthenticatedAdmin = require('./middlewares/admin');
const config = require('./config');
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const cors = require('cors');

admin.initializeApp();
const database = admin.database();
const db = database.ref();

// import the rotues
const userRoutes = require('./routes/user');
const eventsRoutes = require('./routes/events');
const dataRoutes = require('./routes/data');

// Hard-Coded String
const events = "events";
const eventDescription = "eventDescription";
const userRegistrations = "userRegistrations";
const users = "users";
const registeredEvents = "registeredEvents19";
const queries = "queries";

const notifications='notifications';
const sponsorNode = 'sponsors';
const appDevelopers = 'aboutAppDevs';
const food = 'food';
// express
const app = express();
app.use(bodyParser.urlencoded({extended:false}));

// routes
app.use(cors({origin: true}));

// use custom routes
app.use(userRoutes);
app.use(eventsRoutes);
app.use(dataRoutes);

app.post('/query', isAuthenticated, addQuery);
app.put('/admin/query',isAuthenticated, removeQuery);
app.get('/admin/event', isAuthenticated, getEventUsers);
app.get('/admin/query', isAuthenticated, getQuery);

app.post('/admin/notification',addNotification);
app.get('/notification',getNotifications);

// added later for Google Assistant
app.get('/events/search', getEventInformation);
app.post("/sponsors", addSponsor);

// updated user info
// app.get('/updateUsers', updateUsers);

// send swagger
app.get('/swaggerjson',(req,res)=>{
    res.send(swaggerDocument);
})
// serve public
app.use(express.static(__dirname + "/swagger"));
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

function updateUsers(req, res) {
	db.child('users').once('value')
	.then((snapshot) => {
		let data = snapshot.val();
		let users = Object.keys(data);

		let final = [];

		for(let i = 0 ; i < users.length ; i++) {
			// if(data[users[i]]["onBoard"] === true)
			// {
			// 	let zz = '';
			// 	if(data[users[i]]["year"] === 'First')
			// 		zz = 'Second';
			// 	else if(data[users[i]]["year"] === 'Second')
			// 		zz = 'Third';
			// 	else if(data[users[i]]["year"] === 'Third')
			// 		zz = 'Fourth';
			// 	else if(data[users[i]]["year"] === 'Graduate')
			// 		zz = 'Graduated';

				final.push(db.child('users').child(users[i]).update({
					onBoard: false
				}));
			// }
		}

		// eslint-disable-next-line promise/no-nesting
		return Promise.all(final)
		.then(() => {
			return res.status(200).json({
				success: true
			});
		})
		.catch((err) => {
			return res.status(200).json({
				err: err
			});
		})
	})
	.catch((err) => {
		return res.send(err);
	})
}

// return event description with eventName only
// for assistant
function getEventInformation(req, res) {
	let eventName = req.query.eventName;

	if(eventName === undefined) {
		return res.status(400).json({
			success:false,
			message: "Usage: [GET] eventName=name"
		})
	}

	let x = eventName;
	eventName = eventName.toLowerCase();

	db.child(eventDescription).once('value')
	.then((snapshot) => {
		let allData = snapshot.val();

		for(let category in allData) {
			for(let event in allData[category]) {
				let name = event.toLowerCase();
				if(eventName === name) {
					// caching = 12hr (server), 6hr (browser)
					res.set('Cache-Control', 'public, max-age=21600 , s-maxage=43200');
					return res.status(200).json({
						success: true,
						data: allData[category][event]
					})
				}
			}
		}

		return res.status(404).json({
			success: false,
			message: `${x} event not found`
		})
	})
	.catch((err) => {
		return res.status(500).json({
			success: false,
			message: "could not fetch event description",
			err: err
		})
	})
}

// return users registered in one single event
function getEventUsers(req, res) {
	let eventName = req.query.eventName;
	let eventCategory = req.query.eventCategory;

	if(eventName === undefined || eventCategory === undefined) {
		return res.status(400).json({
			success: false,
			message: `Usage: eventName=name&eventCategory=category`
		})
	}

	db.child(events + "/" + eventCategory + "/" + eventName).once('value')
	.then((snapshot) => {
		if(snapshot.val() === null) {
			return res.status(400).json({
				success: false,
				message: `${eventName} in ${eventCategory} doesn't exist`
			})
		}

		db.child(users).once('value')
		.then((snapshot) => {
			let allUsers = snapshot.val();

			let data = {};
			data["users"] = new Array();

			for(user in allUsers) {
				if(allUsers[user][registeredEvents] === undefined) {
					continue;
				}

				if(allUsers[user][registeredEvents][eventCategory] === undefined) {
					continue;
				}

				if(allUsers[user][registeredEvents][eventCategory].indexOf(eventName) !== -1) {
					data["users"].push(allUsers[user]);
				}
			}

			return res.status(200).json({
				data: data,
				success: true
			})
		})
		.catch(() => {
			res.status(500).json({
				success: false,
				message: `error fetching users node`
			})
		})

		return true;
	})
	.catch(() => {
		res.status(500).json({
			success: false,
			message: "could not see events. internal error"
		})
	})
}

//
// <-----Adding query to database------->
// only add newly asked query to the database, if query will be null then it will return the empty query message else query will be added to database.
function addQuery(request,response){
	const query = request.body.text;
	const email=request.body.email;

	console.log(email);
	console.log(query);
	let date=Date.now();
	const email_child='queries/'+email;
	if(query !== undefined) {
		database.ref().child(email_child).child(date).set({
			text:query,
			id:date,
			status:true,
		});
		response.status(200).json({
			success:true,
			message : "query successfully added"
		});
	} else {
		response.status(400).json({
			success:false,
			message: "empty query"
		})
	}
}

// returns query to admin
function getQuery(req, res) {
	db.child(queries).once('value')
	.then(function (snapshot) {
		let userQueries = snapshot.val();

		let data = {};
		data[queries] = new Array();

		for(user in userQueries) {
			let obj = {};

			email = user.replace(/,/g, '.');

			obj["email"] = email;
			obj["query"] = new Array();

			for(query in userQueries[user]) {
				obj["query"].push(userQueries[user][query]);
			}

			data[queries].push(obj);
		}

		return res.status(200).json({
			success: true,
			data: data
		});
	})
	.catch(() => {
		return res.status(500).json({
			error: "error getting queries",
			success: false
		})
	})
}

///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

	                //NOTIFICATIONS

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

function addNotification(req,res){
	if(req.body.notif === undefined) {
		return res.status(400).json({
			success:false,
			error:'empty notification'
		});
	}

	let notif=req.body.notif;
	let date=`${Date.now()}`;
	let node=9999999999999-date;
	db.child('notifications').child(node).set({
		time:date,
		notif:notif
	});
	res.status(200).json({
		success:true,
		message:'notification added'
	});
}

function getNotifications(req,res){
	let data=db.child('notifications').once('value').then(snapshot => {
		//console.log(snapshot.val());
		let notifs = snapshot.val();

		let data = {};
		data[notifications] = new Array();

		for(not in notifs) {
			let obj = {};

			obj["notif"] =notifs[not]['notif'];
			obj["time"] = notifs[not]['time'];

			data[notifications].push(obj);
		}

		return res.json({
			success:true,
			data:data
		});
	}).catch(() => {
		return res.status(500).json({
			error: "error getting notifications",
			success: false
		})
	})
}

/**
	* Function to add a new sponsor in the given section
	* required: sponsor image url, sponsor section
	*/
function addSponsor(request, response) {
	const imageUrl = request.body.sponsor.imageUrl;
	const sponsorSection = request.body.sponsor.sponsorSection;

	const sponsorChild = sponsorNode + '/' + sponsorSection;

	let emptyFields = new Array();

	if(imageUrl === undefined) {
		emptyFields.push('imageUrl');
	}

	if(sponsorSection === undefined) {
		emptyFields.push('sponsorSection');
	}

	if(emptyFields.length === 0) {
		let sponsor = request.body.sponsor;
		delete sponsor.sponsorSection;

		db.child(sponsorChild).push(sponsor);
		response.status(200).json({
			success:true,
			message : "Sponsor successfully added"
		});
	} else {
		const errorMessage = 'Following attributes found empty : ' + emptyFields;
		response.status(400).json({
			success:false,
			message: errorMessage
		});
	}
}

// function to remove a addQuery
function removeQuery(req, response) {
	const id = req.body.id;
	let email=req.body.queryEmail;

	if(id === undefined || email === undefined) {
		return response.status(400).json({
			success: false,
			message: "Usage: queryEmail=queryEmail&id=queryId"
		});
	}

	email = email.replace(/\./g, ',');
	let data={};
	const email_child='queries/'+email;

	db.child(email_child).child(id).update({
		status:false,
	})
	.then(() => {
		return response.status(200).json({
			success:true,
			message : "query successfully deleted"
		});
	})
	.catch(() => {
		return response.status(500).json({
			success: false,
			message: "error updating query status"
		})
	})
}

exports.api = functions.https.onRequest(app);
