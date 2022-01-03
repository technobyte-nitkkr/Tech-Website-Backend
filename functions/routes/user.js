const { googleLogin, signUp, signUpApp, googleLoginApp } = require('../controllers/user');
const isAuthenticated = require('../middlewares/auth');

// import router
const router = require('express').Router();

// web login
router.post('/login', googleLogin);
router.put('/user', isAuthenticated, signUp);
// Android
router.post('/loginApp', googleLoginApp);
router.put('/signUpApp', signUpApp);

// export router
module.exports = router;