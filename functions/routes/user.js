const { getRegisteredEvents, eventRegister, appGetRegisteredEvents, appEventRegister } = require('../controllers/events');
const { googleLogin, signUp, signUpApp, googleLoginApp, addQuery } = require('../controllers/user');
const isAuthenticated = require('../middlewares/auth');

// import router
const router = require('express').Router();

// web login
router.post('/login', googleLogin);
router.put('/user', isAuthenticated, signUp);
// Android
router.post('/loginApp', googleLoginApp);
router.put('/signUpApp', signUpApp);

router.post("/query", isAuthenticated, addQuery);

router.get("/user/event", isAuthenticated, getRegisteredEvents);
router.put("/user/event", isAuthenticated, eventRegister);
// for app registartion
router.get("/user/eventApp", appGetRegisteredEvents, getRegisteredEvents);
router.put("/user/eventApp", appEventRegister, eventRegister);

// export router
module.exports = router;