const jwt=require("jsonwebtoken");
const functions = require("firebase-functions");

// checked if is logged in
exports.isLoggedIn = (req,res,next)=>{
    // get the token from the header if present
    const token = req.headers.authorization;
    
    if (!token) {
        return  res.status(401).json({
          success: false,
          err: "unauthenticated request",
        });
    }

     try {
       const decoded = jwt.verify(token, functions.config().jwt.key);
    //    console.log(decoded);
        const { email , name , role } = decoded;

        req.user = {
            email,
            name,
            role
        };
        req.body.email=  email.replace(/\./g, ',');
     } catch (error) {
       console.log(error.message);
         res.status(401).json({
            succes:false,
            err: "unauthenticated request"
        });
     }

    next();
}

// check for custom role
exports.isCustomRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            err: "unauthorized request not manager or admin",
        });
    }

    next();
};
