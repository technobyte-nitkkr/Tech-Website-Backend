const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const cors = require('cors');
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

exports.api = functions.https.onRequest(app);
