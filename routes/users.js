var express = require("express");
var router = express.Router();
var userHelpers = require("../helpers/userHelpers");
/* GET users listing. */
router.get("/", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          let users = req.session.user;
          userHelpers.findProducts(req.body, (results) => {
            userHelpers.findCategory(req.body, (result1) => {
              userHelpers.findCount(users._id, (result2) => {
                if (results) {
                  res.render("user", { users, results, result1, result2 });
                }
              });
            });
          });
        } else {
          res.redirect("/");
        }
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.get("/single/", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          userHelpers.findSingleProducts(req.query, (results) => {
            res.render("single", { results });
          });
        } else {
          res.redirect("/");
        }
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.get("/profile/", function (req, res) {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          userHelpers.findSingleUser(req.session.userId, (results) => {
            res.render("userProfile", { results });
          });
        } else {
          res.redirect("/");
        }
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.get("/editProfile", function (req, res) {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        userHelpers.findSingleUser(req.session.userId, (result) => {
          res.render("editProfile", { result });
        });
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.post("/editProfileSubmit", function (req, res) {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        userHelpers.editUserProfile(req.query.id, req.body, (result) => {
          if (result) {
            res.redirect("/users/profile");
          }
        });
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.get("/manageAddress", function (req, res) {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        res.render("manageAddress");
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.get("/addAddress", function (req, res) {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        var userId = result._id;
        userHelpers.findAddress(userId,req.query).then((response)=>{
          if(response){
            var err = "Address already added"
          res.render('manageAddress',{err})
        }else{
          res.render('addAddress',{userId,address:req.query.address})
        }
       })
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.post("/addAddressSubmit/", function (req, res) {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
       console.log(req.query.address)
            userHelpers
            .addAddress(req.body, req.query)
            .then((response) => {
              res.redirect("/users/manageAddress");
            });
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.get("/editAddress/", function (req, res) {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        var userId = result._id;
        userHelpers.findAddress(userId,req.query).then((response) => {
          if(response){
            var data = response.address
        res.render("editAddress", { userId, address: req.query.address,data });
        }else{
          var err = 'Address not added'
            res.render('manageAddress',{err})
        }
        });
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.post("/editAddressSubmit/", function (req, res) {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        var userId = result._id;
        userHelpers
          .updateAddress(userId, req.body, req.query)
          .then((response) => {
            res.redirect("/users/manageAddress");
          });
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.get("/removeAddress/", function (req, res) {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        var userId = result._id;
        userHelpers.removeAddress(userId,req.query.address).then((response) => {
          res.redirect("/users/manageAddress");
        });
      } else {
        req.session.userloggedIn = false;
        res.redirect("/");
      }
    } else {
      req.session.userloggedIn = false;
      res.redirect("/");
    }
  });
});

router.post("/findAddress", function (req, res) {
  userHelpers.findAddress(req.body.userId,req.body).then((response) => {
    if(response){
    res.json(response)
   }else{
     res.json(false)
   }
  });
});

module.exports = router;
