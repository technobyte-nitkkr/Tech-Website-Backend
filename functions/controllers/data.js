
const admin = require("firebase-admin");
const database = admin.database();
const db = database.ref();

// Hard-Coded String
const events = "events";
const sponsorNode = 'sponsors';
const appDevelopers = 'aboutAppDevs';
const food = 'food';
const notifications = "notifications";

function foodSponsors(req, res) {
  db.child(food)
    .once("value")
    .then((snapshot) => {
      var results = [];
      let data = snapshot.val();
      if (!data) {
        return res.status(500).json({
          success: false,
          message: "No Food",
        });
      }

      for (let key in data) {
        results.push(data[key]);
      }

      res.set("Cache-Control", "public, max-age=3600 , s-maxage=7200");
      return res.status(200).json({
        success: true,
        data: {
          foodSponsors: results,
        },
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Try Again!",
        error: err,
      });
    });
}

function getAppDevelopers(req, res) {
  db.child(appDevelopers)
    .once("value")
    .then((snapshot) => {
      let information = snapshot.val();
      res.set("Cache-Control", "public, max-age=3600 , s-maxage=7200");
      return res.status(200).json({
        success: true,
        message: "info received",
        data: {
          information,
        },
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Could not fetch app developers.",
        error: err,
      });
    });
}

//send time stamp of the server
function getTimestamp(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(
    JSON.stringify({
      timestamp: Date.now(),
    })
  );
}

function randomFact(request, response) {
  const numberOfLines = 8;
  const randomIndex = Math.floor(Math.random() * numberOfLines);

  database
    .ref("/facts/" + randomIndex)
    .once("value")
    .then((snapshot) => {
      // console.log(snapshot.val());

      //response.set('Cache-Control', 'public, max-age=3600 , s-maxage=7200');

      let data = { message: snapshot.val() };

      return response.status(200).json({
        success: true,
        data: data,
      });
    })
    .catch(() => {
      return response.status(500).json({
        success: false,
        message: "could not fetch facts",
      });
    });
}

//<------Returning the array of all the videos------>
//Returns the array of videos containing title and url of a video.
function video(request, response) {
  return database
    .ref("/videos")
    .once("value")
    .then((snapshot) => {
      // browser caching - 1hr, server caching - 2hr
      response.set("Cache-Control", "public, max-age=3600 , s-maxage=7200");
      let data = snapshot.val();
      return response.status(200).json({ success: true, data: data });
    })
    .catch((err) => {
      return response.send({
        success: false,
        message: `Error occured while fetching videos\n Error : ${err}`,
      });
    });
}

// CONTACT US

function getContacts(req, res) {
  db.child("/contacts")
    .once("value")
    .then((snapshot) => {
      let database = snapshot.val();

      let data = {};
      data["contacts"] = new Array();

      for (let category in database) {
        let type = {};
        type["section"] = category;
        type["logo"] = database[category]["logo"];
        type["people"] = new Array();

        for (let person in database[category]["contacts"]) {
          type["people"].push(database[category]["contacts"][person]);
        }

        data["contacts"].push(type);
      }

      res.set("Cache-Control", "public, max-age=3600 , s-maxage=7200");
      return res.status(200).json({
        data: data,
        success: true,
      });
    })
    .catch(() => {
      return res.status(500).json({
        success: false,
        message: "could not fetch contacts",
      });
    });
}

// TIMESTAMP

// gives next 1 hour events
function getNextEvents(req, res) {
  let timestamp = req.query.timestamp;

  if (timestamp === undefined) {
    return res.status(400).json({
      success: false,
      message: "send timestamp",
    });
  }

  timestamp = parseInt(timestamp);

  db.child(events)
    .once("value")
    .then((snapshot) => {
      let database = snapshot.val();

      let data = {};
      data[events] = new Array();

      for (let category in database) {
        for (let event in database[category]) {
          let startTime = database[category][event].startTime;
          let endTime = database[category][event].endTime;

          startTime = parseInt(startTime);
          endTime = parseInt(endTime);

          database[category][event]["eventCategory"] = category;

          if (timestamp >= startTime && timestamp <= endTime) {
            let obj = {};
            obj["status"] = "LIVE!";
            obj["eventDetails"] = database[category][event];

            data[events].push(obj);
          } else if (
            startTime <= timestamp + 432000000 &&
            startTime >= timestamp
          ) {
            let obj = {};
            obj["status"] = "Upcoming";

            obj["eventDetails"] = database[category][event];
            data[events].push(obj);
          }
        }
      }

      data["events"].sort(sortOrder("startTime"));

      // browser - 10 min, server - 15 min
      res.set("Cache-Control", "public, max-age=600 , s-maxage=900");
      return res.status(200).json({
        success: true,
        data: data,
      });
    })
    .catch(() => {
      return res.status(500).json({
        success: false,
        message: "could not fetch events",
      });
    });
}

function sortOrder(prop) {
  return function (a, b) {
    if (a["eventDetails"][prop] > b["eventDetails"][prop]) {
      return 1;
    } else if (a["eventDetails"][prop] < b["eventDetails"][prop]) {
      return -1;
    }

    return 0;
  };
}

/**
 * Function to get section wise sponsors
 * Called by get on '/sponsor' route
 */
function getSponsors(req, res) {
  db.child(sponsorNode)
    .once("value")
    .then((snapshot) => {
      let database = snapshot.val();

      let data = {};
      data["sponsors"] = new Array();

      for (let sponsorSection in database) {
        let type = {};
        type["sponsorSection"] = sponsorSection;
        type["sponsors"] = new Array();

        for (key in database[sponsorSection]) {
          type["sponsors"].push(database[sponsorSection][key]);
        }

        data["sponsors"].push(type);
      }

      res.set("Cache-Control", "public, max-age=3600 , s-maxage=7200");
      return res.status(200).json({
        data: data,
        success: true,
      });
    })
    .catch(() => {
      return res.status(500).json({
        success: false,
        message: "could not fetch sponsors",
      });
    });
}

function getLectures(req, res) {
  db.child("/lectures")
    .once("value")
    .then((snapshot) => {
      let allLectures = snapshot.val();

      let data = {};
      data["lectures"] = new Array();

      for (lecture in allLectures) {
        data["lectures"].push(allLectures[lecture]);
      }

      res.set("Cache-Control", "public, max-age=3600 , s-maxage=7200");
      return res.status(200).json({
        success: true,
        data: data,
      });
    })
    .catch(() => {
      return res.status(500).json({
        success: false,
        message: "could not fetch lectures",
      });
    });
}

function getDeveloper(req, res) {
  db.child("about")
    .once("value")
    .then((snapshot) => {
      let data = { devs: [] };

      let devs = snapshot.val();
      for (let key in devs) {
        data["devs"].push(devs[key]);
      }

      res.set("Cache-Control", "public, max-age=3600 , s-maxage=7200");
      return res.status(200).json({
        success: true,
        data: data,
      });
    })
    .catch(() => {
      return res.status(500).json({
        success: false,
        message: "error fetching developers",
      });
    });
}

function getFaq(req,res){
  db.child("faq")
    .once("value").then(snapshot => {
      console.log(snapshot.val());
      let data = snapshot.val();
      res.set("Cache-Control", "public, max-age=3600 , s-maxage=7200");
      return res.status(200).json({
        success:true,
        data:data
      });
    }).catch((error) => {
      console.log(error);
      return res.status(500).json({
        error: "error getting FAQ",
        success: false
      })
    })
}

function getNotifications(req,res){
  console.log("notificatons");
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

		return res.status(200).json({
			success:true,
			data:data
		});
	}).catch((error) => {
    console.log(error);
		return res.status(500).json({
			error: "error getting notifications",
			success: false
		})
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

module.exports = {
  foodSponsors,
  getAppDevelopers,
  getSponsors,
  getLectures,
  getDeveloper,
  getTimestamp,
  randomFact,
  video,
  getContacts,
  getNextEvents,
  getNotifications,
  getEventInformation,
  getFaq,
};
