const admin = require("firebase-admin");
const database = admin.database();
const db = database.ref();

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

// function to add notification
function addNotification(req, res) {
  if (req.body.notif === undefined) {
    return res.status(400).json({
      success: false,
      error: "empty notification",
    });
  }

  let notif = req.body.notif;
  let date = `${Date.now()}`;
  let node = 9999999999999 - date;
  db.child("notifications").child(node).set({
    time: date,
    notif: notif,
  });
  res.status(200).json({
    success: true,
    message: "notification added",
  });
}

function updateUsers(req, res) {
  db.child("users")
    .once("value")
    .then((snapshot) => {
      let data = snapshot.val();
      let users = Object.keys(data);

      let final = [];

      for (let i = 0; i < users.length; i++) {
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

        final.push(
          db.child("users").child(users[i]).update({
            onBoard: false,
          })
        );
        // }
      }

      // eslint-disable-next-line promise/no-nesting
      return Promise.all(final)
        .then(() => {
          return res.status(200).json({
            success: true,
          });
        })
        .catch((err) => {
          return res.status(200).json({
            err: err,
          });
        });
    })
    .catch((err) => {
      return res.send(err);
    });
}

function updateRole(req, res) {
	// update the role of the user
	let email = req.body.userEmail;
	let role = req.body.role;

	if(email === undefined || role === undefined) {
		return res.status(400).json({
			success: false,
			error: "Usage: email and role are required"
		});
	}

	// check if role is valid
	if(role !== 'admin' && role !== 'user' && role !== 'manager') {
		return res.status(400).json({
			success: false,
			error: "role must be admin, user or manager"
		});
	}

	email = email.replace(/\./g, ',');
	
	const email_child='users/'+email;

	db.child(email_child).once('value').then(snapshot => {
		if(snapshot.val() === null) {
			return res.status(400).json({
				success: false,
				message: "user not found"
			});
		} else {
			// update the role of the user
			db.child(email_child).update({
				role: role
			});
			return res.status(200).json({
				success: true,
				message: "role updated"
			});
		}}).catch(() => {
			return res.status(500).json({
				success: false,
				message: "error updating user role"
			});
		}
	);
}

function addSponsor(request, response) {
  const imageUrl = request.body.sponsor.imageUrl;
  const sponsorSection = request.body.sponsor.sponsorSection;

  const sponsorChild = sponsorNode + "/" + sponsorSection;

  let emptyFields = new Array();

  if (imageUrl === undefined) {
    emptyFields.push("imageUrl");
  }

  if (sponsorSection === undefined) {
    emptyFields.push("sponsorSection");
  }

  if (emptyFields.length === 0) {
    let sponsor = request.body.sponsor;
    delete sponsor.sponsorSection;

    db.child(sponsorChild).push(sponsor);
    response.status(200).json({
      success: true,
      message: "Sponsor successfully added",
    });
  } else {
    const errorMessage = "Following attributes found empty : " + emptyFields;
    response.status(400).json({
      success: false,
      message: errorMessage,
    });
  }
}

module.exports = {
    addNotification,
    updateUsers,
    getQuery,
    removeQuery,
    getEventUsers,
    addSponsor,
	updateRole,
};