var express = require('express');
var router = express.Router();
var adminHelpers = require('../helpers/adminHelpers')
var userHelpers = require('../helpers/userHelpers')
/* GET home page. */

//------*Admin*-------//
router.get('/', function(req, res, next) {
  res.render('adminLogin', { title: 'Admin LoginPage' });
});

router.get('/adminLogout', function(req, res, next) {
  res.render('/');
});

router.post('/adminPage', function(req, res) {

  adminHelpers.doLogin(req.body,(result)=>{
    if(result){
      res.render('admin')
    }else{
      res.redirect('/admin')
    }
})
});
router.get('/adminPage', function(req, res) {

      res.render('admin')
   

});


//-------*User*---------//

router.get('/manageUsers', function(req, res) {
  userHelpers.findUser(req.body,(results)=>{
    if(results){
        res.render('manageUsers',{results:results})
    }
  })
});

router.get('/removeUser/', function(req, res) {
  userHelpers.removeUser(req.query,(result)=>{
      res.redirect('/admin/manageUsers')
  })

});

router.get('/blockUser/', function(req, res) {
  if(req.query.status=='Block'){
    userHelpers.blockUser(req.query,'Unblock',(result)=>{
      res.redirect('/admin/manageUsers')
    })

  }else if(req.query.status=='Unblock'){
    userHelpers.blockUser(req.query,'Block',(result)=>{
      res.redirect('/admin/manageUsers')
    })

  }
});



//---------*Category*-------//
router.get('/manageCategory', function(req, res) {

  userHelpers.findCategory(req.body,(results)=>{

    if(results){
      res.render('manageCategory',{results:results})
    }
  })

});

router.get('/addCategory', function(req, res) {

  res.render('addCategory')
});

router.post('/addCategory', function(req, res) {
  userHelpers.addCategory(req.body,(results)=>{
      if(results){
          res.redirect('/admin/manageCategory')
      }else{
          res.render('addCategory')
      }
  })
});

router.get('/editCategory/', function(req, res) {
  var name = req.query.name
  res.render('editCategory',{name:name})
})

router.post('/editCategory/', function(req, res) {
  userHelpers.editCategory(req.body,req.query,(results)=>{
    if(results){
        res.redirect('/admin/manageCategory')
    }
  })
})

router.get('/removeCategory/', function(req, res) {
  userHelpers.removeCategory(req.query,(results)=>{
    if(results){
          res.redirect('/admin/manageCategory')
        
    }
  })
})


//-----*Products*------//
router.get('/manageProducts', function(req, res) {

  userHelpers.findProducts(req.body,(results)=>{
    if(results){
      res.render('manageProducts',{results:results})
    }
  })
});

router.get('/addProducts', function(req, res) {

  userHelpers.findCategory(req.body,(results)=>{
    if(results){
      res.render('addProducts',{results:results})
    }
  })

});

router.post('/addProducts', function(req, res) {

  userHelpers.addProducts(req.body,(id)=>{
      let image = req.files.image
      image.mv('./public/product_images/'+id+'.jpg',(err,done)=>{

        if(!err){
            res.redirect('/admin/manageProducts')
        }

      })
  })

});


router.get('/editProducts', function(req, res) {
  userHelpers.findSingleProducts(req.query,(results)=>{
    if(results){

      userHelpers.findCategory(req.body,(category)=>{
        if(category){
          res.render('editProducts',{results,category})
        }
      })
      
    }
  })
});


router.post('/editProducts/', function(req, res) {
  userHelpers.editProducts(req.body,req.query,(result)=>{
      if(result){
            res.redirect('/admin/manageProducts')
            if(req.files.images){
              let image = req.files.images
              image.mv('./public/product_images/'+req.query.id+'.jpg')
            }
      }
  })

});

router.get('/removeProducts', function(req, res) {

  userHelpers.removeProducts(req.query,(results)=>{
    if(results){
      res.redirect('/admin/manageProducts')
    }
  })

});

module.exports = router;
