const { getEventNames, getCategories,getEventDescription, getEventTimeline, addEvent, getRegisteredEvents, eventRegister, appGetRegisteredEvents, appEventRegister
 } = require("../controllers/events");
const isAuthenticated = require("../middlewares/auth");
const router = require("express").Router();

router.get("/events", getEventNames);
router.get("/events/categories", getCategories);
router.get("/events/description", getEventDescription);
router.get("/events/timeline", getEventTimeline);
router.post("/events", isAuthenticated, addEvent);

module.exports = router;