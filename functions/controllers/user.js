const functions = require("firebase-functions");
const admin = require("firebase-admin");
const request = require("request");
const database = admin.database();
const db = database.ref();

const jwt = require("jsonwebtoken");
const { options } = require("../routes/user");

const googleUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=";

// google login web
exports.googleLogin = (req, response) => {
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
            role: snapshot.val().role,
          };
        } else {
          jwttoken = {
            email: snapshot.val().email,
            name: snapshot.val().name,
            picture: snapshot.val().picture,
            onBoard: snapshot.val().onBoard,
            admin: snapshot.val().admin,
            role: snapshot.val().role,
          };
        }

        const token = jwt.sign(jwttoken, functions.config().jwt.key);
        data = { token: token , user : jwttoken};
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
          role: "user",
        });

        jwttoken = {
          email: body.email,
          name: body.name,
          picture: body.picture,
          onBoard: false,
          admin: false,
          role: "user",
        };

        const token = jwt.sign(jwttoken, functions.config().jwt.key);
        data = { token: token, user: jwttoken };

        return response.status(200).json({
          onBoard: false,
          success: true,
          data: data,
        });
      }
    });
  });
};

// signup for app
exports.signUpApp = (req, res) => {
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
        role: snapshot.val().role,
      };
      let jwttoken = {
        email: snapshot.val().email,
        name: snapshot.val().name,
        picture: snapshot.val().picture,
        onBoard: snapshot.val().onBoard,
        phone: snapshot.val().phone,
        college: snapshot.val().college,
        year: snapshot.val().year,
        admin: snapshot.val().admin,
        role: snapshot.val().role,
      };

      const token = jwt.sign(jwttoken, functions.config().jwt.key, {
        expiresIn: "3d",
      });

      return res.status(200).json({
        success: true,
        message: "user onboarded",
        data: {
          user: info,
          token: token,
        }
      });
    } else {
      return res.status(405).json({
        success: false,
        err: "not allowed, already onboarded",
      });
    }
  });
};

// signup for web
exports.signUp = (req, response) => {
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
          role: snapshot.val().role,
        };
        const token = jwt.sign(jwttoken, functions.config().jwt.key);
        let data = { token: token ,user : jwttoken};
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
};

// google login for app
exports.googleLoginApp = (req, res) => {
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
        let jwttoken;
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
              role: snapshot.val().role,
            };
            jwttoken = {
              email: snapshot.val().email,
              name: snapshot.val().name,
              picture: snapshot.val().picture,
              onBoard: snapshot.val().onBoard,
              phone: snapshot.val().phone,
              college: snapshot.val().college,
              year: snapshot.val().year,
              admin: snapshot.val().admin,
              role: snapshot.val().role,
            };
          } else {
            info = {
              email: snapshot.val().email,
              name: snapshot.val().name,
              picture: snapshot.val().picture,
              onBoard: snapshot.val().onBoard,
              admin: snapshot.val().admin,
              role: snapshot.val().role,
            };
            jwttoken = {
              email: snapshot.val().email,
              name: snapshot.val().name,
              picture: snapshot.val().picture,
              onBoard: snapshot.val().onBoard,
              admin: snapshot.val().admin,
              role: snapshot.val().role,
            };
          }

          const token = jwt.sign(jwttoken, functions.config().jwt.key);

          return res.status(200).json({
            success: true,
            onBoard: snapshot.val().onBoard,
            data: {
              user: info,
              token: token,
            },
          });
        } else {
          database.ref(email_child).set({
            onBoard: false,
            email: body.email,
            name: body.name,
            picture: body.picture,
            admin: false,
            role: "user",
          });

          info = {
            email: body.email,
            name: body.name,
            picture: body.picture,
            onBoard: false,
            admin: false,
            role: "user",
          };
          const token = jwt.sign(info, functions.config().jwt.key);

          return res.status(200).json({
            success: true,
            onBoard: false,
            data: {
              user: info,
              token: token,
            },
          });
        }
      });
    }
  );
};

//
// <-----Adding query to database------->
// only add newly asked query to the database, if query will be null then it will return the empty query message else query will be added to database.
exports.addQuery = (request, response) => {
  const query = request.body.text;
  const email = request.body.email;

  if (query === undefined || email === undefined) {
    return response.status(400).json({
      success: false,

      err: "please pass valid/complete url parameters",
    });
  }

  // console.log(email);
  // console.log(query);
  let date = Date.now();
  const email_child = "queries/" + email;
  if (query !== undefined) {
    database.ref().child(email_child).child(date).set({
      text: query,
      id: date,
      status: true,
    });
    response.status(200).json({
      success: true,
      message: "query successfully added",
    });
  } else {
    response.status(400).json({
      success: false,
      message: "empty query",
    });
  }
};

exports.generageJwt = (req, response) => {
  console.log("generage jwt");
  let email_child = req.body.email.replace(/\./g, ",");
  let email = "users/" + email_child;
  let ref = database.ref().child(email);
  ref.once("value", (snapshot) => {
    if (snapshot.val()) {
      console.log(snapshot.val());
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
          role: snapshot.val().role,
        };
      } else {
        return response.status(405).json({
          success: false,
          err: "invalid email not registered",
        });
      }

      const token = jwt.sign(jwttoken, functions.config().jwt.key);
      data = { token: token };
      return response.status(200).json({
        onBoard: snapshot.val().onBoard,
        success: true,
        data: data,
      });
    } else {
      return response.status(405).json({
        success: false,
        err: "invalid email not registered",
      });
    }
  });
};
