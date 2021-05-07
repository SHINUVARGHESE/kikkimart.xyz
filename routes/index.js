var express = require("express");
const session = require('express-session');
var router = express.Router();
var userHelpers = require("../helpers/userHelpers");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  userHelpers.findProducts(req.body, (results) => {
    if (results) {
      userHelpers.findCategory(req.body, (result) => {
        if (results) {
          res.render("index", { title: "Home Page", results, result , value: req.session.error });
          req.session.error=false
        }
      });
    }
  });
});

router.get("/signUp", function (req, res) {
  res.render("signUp");
});

router.get("/logIn", function (req, res) {
    res.render('login')
});

router.get("/contact", function (req, res) {
  res.render("contact");
});

router.get("/about", function (req, res) {
  res.render("about");
});

router.post("/signUp", function (req, res) {
  userHelpers.dosignUp(req.body, (results) => {
    if (results) {
      res.redirect("/login");
    } else {
      res.redirect("/signUp");
    }
  });
});

router.post("/logIn", function (req, res) {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      userHelpers.checkStatus(req.body,(result) => {
        if (result.status == "Block") {
          req.session.userloggedIn=true
          req.session.user=response
          res.redirect("/users");
        } else if (result.status == "Unblock") {
          let err = "You are blocked by admin";
          res.render("login", { err });
        }
      });
    } else {
      let err = "You are entered wrong input";
      res.render("login", { err });
    }
  });

  router.get('/logout', function(req, res) {
    res.render('index')
  });
});

module.exports = router;
