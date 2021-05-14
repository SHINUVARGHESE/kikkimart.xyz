var express = require("express");
var router = express.Router();
var userHelpers = require("../helpers/userHelpers");
/* GET users listing. */
router.get("/", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
 if(req.session.userloggedIn){
  let users = req.session.user;
    userHelpers.findProducts(req.body, (results) => {
      userHelpers.findCategory(req.body, (result1) => {
       userHelpers.findCount(users.data._id, (result2) => {
         if (results) {
           res.render("user", { users, results, result1,result2 });
         }
       }); 
      });
    });
  }else{
    res.redirect('/')
  }
});

router.get("/single/", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
 if(req.session.userloggedIn){
  userHelpers.findSingleProducts(req.query, (results) => {
       res.render("single", {results});
    });
 }else{
   res.redirect('users')
 } 
});

router.get("/profile/", function (req, res) {
  userHelpers.findSingleUser(req.query.id, (results) => {
   res.render('userProfile',{results})
  });
});

module.exports = router;
