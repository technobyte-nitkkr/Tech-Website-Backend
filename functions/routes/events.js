const { getEventNames, getCategories,getEventDescription, getEventTimeline, addEvent, getRegisteredEvents, eventRegister, appGetRegisteredEvents, appEventRegister
 } = require("../controllers/events");
const isAuthenticated = require("../middlewares/auth");
const router = require("express").Router();

router.get("/events", getEventNames);
router.get("/events/categories", getCategories);
router.get("/events/description", getEventDescription);
router.get("/events/timeline", getEventTimeline);
router.post("/events", isAuthenticated, addEvent);
router.get("/user/event", isAuthenticated, getRegisteredEvents);
router.put("/user/event", isAuthenticated, eventRegister);
// for app registartion
router.get("/user/eventApp", appGetRegisteredEvents, getRegisteredEvents);
router.put("/user/eventApp", appEventRegister, eventRegister);

module.exports = router;