// const functions = require('firebase-functions');
require("dotenv").config();
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const cors = require('cors');
var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://techspardha-87928.firebaseio.com",
});

//
// admin.initializeApp();
const path = require('path');

// import the rotues
const userRoutes = require('./routes/user');
const eventsRoutes = require('./routes/events');
const dataRoutes = require('./routes/data');
const adminRoutes = require('./routes/admin');
const mailHelper = require('./utils/emailHelper');
const { basicmail } = require('./utils/basicmail');

// express
const app = express();

// middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());

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
app.get('/api-docs',(req,res)=>{
	res.sendFile(path.join(__dirname,'swagger','index.html'));
});

// app.get('/email',(req,res)=>{
// 	res.send(basicmail("helo","helo","helo","helo","helo"));
// })

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

// exports.api = functions.https.onRequest(app);

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
