const admin = require('firebase-admin');
const request = require("request");
const database = admin.database();
const db = database.ref();
const googleUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=";

// google login web
exports.googleLogin=(req, response)=> {
  request(googleUrl + req.body.idToken, { json: true }, (err, res, body) => {
    let data;
    if (err) {
      return res.status(400).json({ success: false, err: err });
    }

    if (body.error_description !== undefined) {
      return response.status(401).json({
        message: "empty/invalid body received",
        error: "unauthenticated request",
        success: false,
      });
    }

    let email1 = body.email;
    let email = email1.replace(/\./g, ",");
    let email_child = "users/" + email;
    let ref = database.ref().child(email_child);
    let picture = body.picture;
    ref.once("value", (snapshot) => {
      if (snapshot.val()) {
        /*	data = {
				onBoard: snapshot.val().onBoard,
				authenticatedRequest: true,
				isRegistered: true,
				body: body
			};*/

        if (snapshot.val().onBoard === true) {
          jwttoken = {
            email: snapshot.val().email,
            name: snapshot.val().name,
            picture: snapshot.val().picture,
            onBoard: snapshot.val().onBoard,
            phone: snapshot.val().phone,
            college: snapshot.val().college,
            year: snapshot.val().year,
            admin: snapshot.val().admin,
          };
        } else {
          jwttoken = {
            email: snapshot.val().email,
            name: snapshot.val().name,
            picture: snapshot.val().picture,
            onBoard: snapshot.val().onBoard,
            admin: snapshot.val().admin,
          };
        }

        const token = jwt.sign(jwttoken, config.key);
        data = { token: token };
        return response.status(200).json({
          onBoard: snapshot.val().onBoard,
          success: true,
          data: data,
        });
      } else {
        database.ref(email_child).set({
          onBoard: false,
          email: body.email,
          name: body.name,
          picture: body.picture,
          admin: false,
        });

        jwttoken = {
          email: body.email,
          name: body.name,
          picture: body.picture,
          onBoard: false,
          admin: false,
        };

        const token = jwt.sign(jwttoken, config.key);
        data = { token: token };

        return response.status(200).json({
          onBoard: false,
          success: true,
          data: data,
        });
      }
    });
  });
}

// signup for app
exports.signUpApp=(req, res) =>{
  if (
    req.body.phone === undefined ||
    req.body.college === undefined ||
    req.body.year === undefined
  ) {
    return res.status(400).json({
      success: false,
      err: "please pass valid/complete url parameters",
    });
  }

  if (req.body.email === undefined) {
    return res.status(400).json({
      success: false,
      message: "unauthenticated, email reqd",
    });
  }

  let email1 = req.body.email;
  let email = email1.replace(/\./g, ",");
  let ref = database.ref("users/" + email);

  ref.once("value", (snapshot) => {
    if (snapshot.val() === null || snapshot.val() === undefined) {
      return res.status(403).json({
        success: false,
        err: "user does not exist",
      });
    } else if (snapshot.val().onBoard === false) {
      ref.update({
        onBoard: true,
        phone: req.body.phone,
        college: req.body.college,
        year: req.body.year,
      });

      let info = {
        email: snapshot.val().email,
        name: snapshot.val().name,
        picture: snapshot.val().picture,
        onBoard: true,
        phone: req.body.phone,
        college: req.body.college,
        year: req.body.year,
        admin: snapshot.val().admin,
      };

      return res.status(200).json({
        success: true,
        message: "user onboarded",
        information: info,
      });
    } else {
      return res.status(405).json({
        success: false,
        err: "not allowed, already onboarded",
      });
    }
  });
}

// signup for web
exports.signUp = (req, response) =>  {
  if (
    req.body.phone === undefined ||
    req.body.college === undefined ||
    req.body.year === undefined
  ) {
    return response.status(400).json({
      success: false,
      err: "please pass valid/complete url parameters",
    });
  } else {
    let email = req.body.email;
    let ref = database.ref("users/" + email);

    ref.once("value", (snapshot) => {
      if (snapshot.val() === null || snapshot.val() === undefined) {
        return response.status(403).json({
          success: false,
          err: "user does not exist",
        });
      } else if (snapshot.val().onBoard === false) {
        ref.update({
          onBoard: true,
          phone: req.body.phone,
          college: req.body.college,
          year: req.body.year,
        });

        jwttoken = {
          email: snapshot.val().email,
          name: snapshot.val().name,
          picture: snapshot.val().picture,
          onBoard: true,
          phone: req.body.phone,
          college: req.body.college,
          year: req.body.year,
          admin: snapshot.val().admin,
        };
        const token = jwt.sign(jwttoken, config.key);
        let data = { token: token };
        return response.status(200).json({
          success: true,
          message: "user onboarded",
          data: data,
        });
      } else {
        return response.status(405).json({
          success: false,
          err: "not allowed, already onboarded",
        });
      }
    });
  }
}

// google login for app
exports.googleLoginApp=(req, res)=> {
  request(
    googleUrl + req.body.idToken,
    { json: true },
    (err, response, body) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err,
        });
      }

      if (body.error_description !== undefined) {
        return res.status(401).json({
          success: false,
          message: "empty/invalid body received",
          error: `unauthenticated request: ${body.error_description}`,
        });
      }

      let email1 = body.email;
      let email = email1.replace(/\./g, ",");
      let email_child = "users/" + email;
      let ref = database.ref().child(email_child);

      let info;

      ref.once("value", (snapshot) => {
        if (snapshot.val()) {
          if (snapshot.val().onBoard === true) {
            info = {
              email: snapshot.val().email,
              name: snapshot.val().name,
              picture: snapshot.val().picture,
              onBoard: snapshot.val().onBoard,
              phone: snapshot.val().phone,
              college: snapshot.val().college,
              year: snapshot.val().year,
              admin: snapshot.val().admin,
            };
          } else {
            info = {
              email: snapshot.val().email,
              name: snapshot.val().name,
              picture: snapshot.val().picture,
              onBoard: snapshot.val().onBoard,
              admin: snapshot.val().admin,
            };
          }

          return res.status(200).json({
            success: true,
            onBoard: snapshot.val().onBoard,
            information: info,
          });
        } else {
          database.ref(email_child).set({
            onBoard: false,
            email: body.email,
            name: body.name,
            picture: body.picture,
            admin: false,
          });

          info = {
            email: body.email,
            name: body.name,
            picture: body.picture,
            onBoard: false,
            admin: false,
          };

          return res.status(200).json({
            success: true,
            onBoard: false,
            information: info,
          });
        }
      });
    }
  );
}
