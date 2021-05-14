const { response } = require("express");
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
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  if(req.session.userloggedIn){
    res.redirect('users')
  }else{
  res.render("signUp");
  }
});

router.get("/logIn", function (req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  if(req.session.userloggedIn){
    res.redirect('users')
  }else{
    res.render('login')
    }
});

router.get("/contact", function (req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  if(req.session.userloggedIn){
    res.redirect('users')
  }else{
  res.render("contact");
  }
});

router.get("/about", function (req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  if(req.session.userloggedIn){
    res.redirect('users')
  }else{
  res.render("about");
  }
});

router.post("/signUp", function (req, res) {
  userHelpers.findMail(req.body, (result) => {
    if(result){
      let usedMail = "This mailId is already used. Please choose another."
      res.render('signUp',{usedMail});
    }else{
      userHelpers.dosignUp(req.body, (results) => {
        if (results) {
          res.redirect("/login");
        } else {
          res.redirect("/signUp");
        }
      });
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
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    if(req.session.userloggedIn){
    req.session.userloggedIn=false
    res.redirect('/')
    }
  });

  router.get('/addToCart/:id',(req, res)=> {
    if(req.session.userloggedIn){
      var userId = req.session.user.data._id
      userHelpers.addToCart(userId,req.params.id).then(()=>{
        res.json({status:true})
      })

    }
  });


  router.get('/checkout', async (req, res)=> {
    let total = await userHelpers.getTotalAmount(req.session.user.data._id)
    res.render('checkout',{total,user:req.session.user.data})
  });

  router.post('/checkoutSubmit', async(req, res)=> {
    let products = await userHelpers.getCartProductList(req.body.userid)
    let total = await userHelpers.getTotalAmount(req.body.userid)
    userHelpers.checkout(req.body,products,total).then((response)=>{
        res.json({status:true})
    })
  });

  router.post('/placeOrder', async (req, res)=>{
    if(req.session.userloggedIn){
    let products =await userHelpers.cartProducts(req.session.user.data._id)
    let total = await userHelpers.getTotalAmount(req.session.user.data._id)
    if(products){
    res.render('placeOrder',{products,user:req.session.user.data._id,total})
    }else{
      res.redirect('/users')
    }
   }
  });

  router.get('/viewOrders', async(req, res)=> {
    let orders= await userHelpers.getUserOrders(req.session.user.data._id)
        res.render('orders',{orders,user:req.session.user.data._id})
  });

  router.post('/changeProductQuantity',(req, res)=> {
    userHelpers.changeProductQuantity(req.body).then( async(response)=>{
    response.total = await userHelpers.getTotalAmount(req.body.id)
      res.json(response)
    })
    
  });

  router.post('/removeCaartProduct',(req, res)=> {
    userHelpers.removeCaartProduct(req.body).then((response)=>{
      res.json(response)
    })
    
  });

  router.get('/success',(req, res)=> {
      res.render('success')
  });

  router.get('/viewOrderProduct/',async (req, res)=> {
   let products= await userHelpers.viewOrderProduct(req.query.id)
      res.render('viewOrderProduct',{products})
  });

  router.get('/cancelOrder/',(req, res)=> {
    userHelpers.cancelOrder(req.query.id).then((response)=>{
      res.redirect('/viewOrders')
    })
  });

});

module.exports = router;
