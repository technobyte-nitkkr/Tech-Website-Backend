
const {
  foodSponsors,
  getAppDevelopers,
  getSponsors,
  getLectures,
  getDeveloper,
  randomFact,
  video,
  getContacts,
  getNextEvents,
  getNotifications,
} = require("../controllers/data");

const router = require("express").Router();

router.get("/facts", randomFact
);
router.get("/videos", video);
// router.get("/timestamp", getTimestamp);
router.get("/timestamp/events", getNextEvents);
router.get("/contacts", getContacts);

router.get("/lectures", getLectures);
// Route to obtain section wise sponsors
router.get("/sponsors", getSponsors);
router.get("/foodSponsors", foodSponsors);

router.get("/about", getDeveloper);
router.get("/aboutAppDevs", getAppDevelopers);
router.get("/notification", getNotifications);
// router.get("/events/search", getEventInformation);
module.exports = router;