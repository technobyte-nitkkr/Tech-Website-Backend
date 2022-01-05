const { getEventNames, getCategories,getEventDescription, getEventTimeline, addEvent, addCategory, 
 } = require("../controllers/events");
const { isLoggedIn, isCustomRole } = require("../middlewares/user");

const router = require("express").Router();

router.get("/events", getEventNames);
router.get("/events/categories", getCategories);
router.get("/events/description", getEventDescription);
router.get("/events/timeline", getEventTimeline);

module.exports = router;