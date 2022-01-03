const admin = require("firebase-admin");
const database = admin.database();
const db = database.ref();

// Hard-Coded String
const events = "events";
const sponsorNode = 'sponsors';
const appDevelopers = 'aboutAppDevs';
const food = 'food';

function foodSponsors(req, res) {
  db.child(food)
    .once("value")
    .then((snapshot) => {
      let data = snapshot.val();
      if (!data) {
        return res.status(500).json({
          success: false,
          message: "No Food",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          foodSponsors: data,
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
        type["people"] = new Array();

        for (let person in database[category]) {
          type["people"].push(database[category][person]);
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

function sponsorStatic(req, res) {
  let data = {
    data: {
      paisa: [
        {
          sponsorSection: "Associate Sponsors",
          sponsors: [
            {
              imageUrl: "https://i.ibb.co/rbytcLS/2-IIM-Original-Logo.png",
              targetUrl: "https://www.2iim.com/",
            },
            {
              imageUrl:
                "https://www.stbaldricks.org/photo/event/6249/2019/large",
              targetUrl: "https://ihsmarkit.com",
            },
            {
              imageUrl: "https://pbs.twimg.com/media/CFWHUNrUMAAlDfz.jpg",
              targetUrl: "https://www.swiggy.com/",
            },
          ],
        },
        {
          sponsorSection: "Intern Partner",
          sponsors: [
            {
              imageUrl: "https://i.ibb.co/kSmtpGr/HI-Logo-PNG.png",
              targetUrl: "https://www.hellointern.com/",
            },
          ],
        },
        {
          sponsorSection: "Media Partner",
          sponsors: [
            {
              imageUrl:
                "https://upload.wikimedia.org/wikipedia/commons/2/29/The_Pioneer_logo.jpg",
              targetUrl: "https://www.dailypioneer.com/",
            },
          ],
        },
      ],
    },
    success: true,
  };

  res.status(200).json(data);
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

      data["devs"].sort((a, b) => {
        // if((parseInt(b["year"]) - parseInt(a["year"])) === 0) {
        // 	if(a["name"] < b["name"]) {
        // 		return -11;
        // 	}
        // 	else {
        // 		return 0
        // 	}
        // }
        return parseInt(b["year"]) - parseInt(a["year"]);
      });
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
  sponsorStatic,
};
