const { updateUsers, addNotification, getQuery, removeQuery, getEventUsers, addSponsor } = require("../controllers/admin");
const { addEvent } = require("../controllers/events");
const { generageJwt } = require("../controllers/user");

const { isLoggedIn, isCustomRole } = require("../middlewares/user");
const router = require("express").Router();

// manager routes
router.post("/events", isLoggedIn,isCustomRole("admin"), addEvent);

// admin routes
router.put("/admin/query", isLoggedIn, isCustomRole("admin"), removeQuery);
router.get("/admin/event", isLoggedIn, isCustomRole("admin"), getEventUsers);
router.get("/admin/query", isLoggedIn, isCustomRole("admin","user"), getQuery);
router.post("/admin/notification",isLoggedIn,isCustomRole("admin"), addNotification);
router.post("/sponsors", isLoggedIn, isCustomRole("admin"), addSponsor);

// updated user info
// router.get('/updateUsers', updateUsers);

// temporary for testing
router.post("/getjwt",generageJwt);

module.exports = router;
