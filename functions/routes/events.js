const { getEventNames, getCategories,getEventDescription, getEventTimeline, addEvent, 
 } = require("../controllers/events");

const router = require("express").Router();

router.get("/events", getEventNames);
router.get("/events/categories", getCategories);
router.get("/events/description", getEventDescription);
router.get("/events/timeline", getEventTimeline);

module.exports = router;