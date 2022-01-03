const { updateUsers, addNotification, getQuery, removeQuery, getEventUsers, addSponsor } = require("../controllers/admin");
const isAuthenticated = require("../middlewares/auth");
const router = require("express").Router();
router.put("/admin/query", isAuthenticated, removeQuery);
router.get("/admin/event", isAuthenticated, getEventUsers);
router.get("/admin/query", isAuthenticated, getQuery
);
router.post("/admin/notification", addNotification
);

// updated user info
// router.get('/updateUsers', updateUsers);
router.post("/sponsors", addSponsor);

module.exports = router;
