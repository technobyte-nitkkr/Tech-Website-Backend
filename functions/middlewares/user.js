const jwt=require("jsonwebtoken");
const config=require("../config");

// checked if is logged in
exports.isLoggedIn = (req,res,next)=>{
    // get the token from the header if present
    const token = req.headers.authorization;
    
    if (!token) {
        res.status(401).json({
          success: false,
          err: "unauthenticated request",
        });
    }

     try {
       const decoded = jwt.verify(token, config.key);
       console.log(decoded);
        const { email , name , admin } = decoded;

        req.user = {
            email,
            name,
            admin
        };
     } catch (error) {
       console.log(error.message);
         res.status(401).json({
            succes:false,
            err: "unauthenticated request"
        });
     }

    next();
}

// check if is admin

exports.isAdmin = (req,res,next)=>{
    const { admin } = req.user;
    if(admin){
        next();
    }else{
        res.status(401).json({
            success:false,
            err: "you are not an admin, please request admin rights"
        });
    }
}
