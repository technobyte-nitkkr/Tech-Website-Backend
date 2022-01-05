const { getRegisteredEvents, eventRegister,eventUnregister } = require('../controllers/events');
const { googleLogin, signUp, signUpApp, googleLoginApp, addQuery } = require('../controllers/user');

const { isLoggedIn } = require('../middlewares/user');

// import router
const router = require('express').Router();

// web login
router.post('/login', googleLogin);
router.put('/user', isLoggedIn, signUp);
// Android
router.post('/loginApp', googleLoginApp);
router.put('/signUpApp',isLoggedIn, signUpApp);

router.post("/query", isLoggedIn, addQuery);

router.get("/user/event", isLoggedIn, getRegisteredEvents);
router.put("/user/event", isLoggedIn, eventRegister);
router.put("/user/event/unregister", isLoggedIn, eventUnregister);

// export router
module.exports = router;