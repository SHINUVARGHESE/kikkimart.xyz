var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/userHelpers') 
/* GET users listing. */
router.get('/', function(req, res) {
  let users=req.session.user
  userHelpers.findProducts(req.body,(results)=>{
    userHelpers.findCategory(req.body,(result)=>{
      if(results){
        
  console.log(users);
        res.render('user', {users,results,result});
      }
    })
  })
});

router.get('/single/', function(req, res) {
  let ids = req.query.id
  let names = req.query.name
  let discriptions = req.query.discription
  let prices = req.query.price
      res.render('single',{ids,names,discriptions,prices})
});

module.exports = router;
