
const {
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
} = require("../controllers/data");
const isAuthenticated = require("../middlewares/auth");
const router = require("express").Router();

router.get("/facts", randomFact
);
router.get("/videos", video);
router.get("/timestamp", getTimestamp);
router.get("/timestamp/events", getNextEvents);
router.get("/contacts", getContacts);

router.get("/lectures", getLectures);
// Route to obtain section wise sponsors
router.get("/sponsors", sponsorStatic);
router.get("/foodSponsors", foodSponsors);

// Route to add a sponsor to a section

// app.post('/about', addDeveloper);
router.get("/about", getDeveloper);
router.get("/aboutAppDevs", getAppDevelopers);

module.exports = router;