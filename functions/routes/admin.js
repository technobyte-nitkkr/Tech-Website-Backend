const { updateUsers, addNotification, getQuery, removeQuery, getEventUsers, addSponsor, updateRole, emailtoarray, getEventUsersEmails, sendNotification } = require("../controllers/admin");
const { addEvent, addCategory } = require("../controllers/events");

const { isLoggedIn, isCustomRole } = require("../middlewares/user");
const router = require("express").Router();

// manager routes
router.post("/events", isLoggedIn,isCustomRole("admin","manager"), addEvent);
router.get("/admin/event", isLoggedIn, isCustomRole("admin","manager"), getEventUsers);
router.get("/admin/query", isLoggedIn, isCustomRole("admin","manager"), getQuery);
router.post("/admin/notification",isLoggedIn,isCustomRole("admin","manager"), addNotification);
router.post("/sponsors", isLoggedIn, isCustomRole("admin","manager"), addSponsor);
router.post("/admin/mail/list",isLoggedIn, isCustomRole("admin"),emailtoarray);
router.post("/admin/mail/category",isLoggedIn, isCustomRole("admin","manager"),getEventUsersEmails,emailtoarray);
// TODO: resolve query with email notificaton

// admin routes
// app.post('/about', addDeveloper);
// TODO: add mobile app and web app developers
router.put("/admin/query", isLoggedIn, isCustomRole("admin"), removeQuery);
router.put("/admin/user", isLoggedIn, isCustomRole("admin"), updateRole);
router.post("/events/categories",isLoggedIn,isCustomRole("admin"), addCategory);
router.post("/admin/mobilenoti",isLoggedIn, isCustomRole("admin"),sendNotification);

// updated user info
// router.get('/updateUsers', updateUsers);

// temporary for testing
// router.post("/getjwt",generageJwt);

module.exports = router;
