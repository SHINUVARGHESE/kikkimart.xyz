var express = require("express");
const session = require("express-session");
var router = express.Router();
var adminHelpers = require("../helpers/adminHelpers");
var userHelpers = require("../helpers/userHelpers");
var fs = require("fs");
/* GET home page. */

//------*Admin*-------//
router.get("/", function (req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (req.session.adminloggedIn) {
    res.redirect('/admin/viewAdmin');
  } else {
    res.render("adminLogin", { title: "Admin LoginPage" });
  }
});

router.get("/viewAdmin", function (req, res, next) {
  userHelpers.findAllOrders(req.body,(orders) => {
        res.render("admin",{orders});
  })

});


router.get("/adminLogout", function (req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (req.session.adminloggedIn) {
    req.session.adminloggedIn = false;
    res.redirect("/admin");
  } else {
    res.render("adminLogin");
  }
});

router.get("/adminPage", function (req, res) {
  if (req.session.adminloggedIn) {
    res.redirect('/admin/viewAdmin');
  } else {
   res.redirect('/admin')
  }
});

router.post("/adminPage", function (req, res) {
  if (req.session.adminloggedIn) {
    res.redirect('/admin/viewAdmin');
  } else {
    adminHelpers.doLogin(req.body, (result) => {
      if (result) {
        req.session.adminloggedIn = true;
        userHelpers.findAllOrders(req.body,(orders) => {
              res.render("admin",{orders});
        })
      } else {
        var err = "Input not matching";
        res.render("adminLogin", { err });
      }
    });
  }
});

//-------*User*---------//

router.get("/manageUsers", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (req.session.adminloggedIn) {
    userHelpers.adminfindUser(req.body, (results) => {
      if (results) {
        res.render("manageUsers", { results: results });
      }
    });
  } else {
    res.redirect('/admin/viewAdmin');
  }
});

router.get("/removeUser/", function (req, res) {
  userHelpers.removeUser(req.query, (result) => {
    res.redirect("/admin/manageUsers");
  });
});

router.get("/blockUser/", function (req, res) {
  if (req.query.status == "Block") {
    userHelpers.blockUser(req.query, "Unblock", (result) => {
      res.redirect("/admin/manageUsers");
    });
  } else if (req.query.status == "Unblock") {
    userHelpers.blockUser(req.query, "Block", (result) => {
      res.redirect("/admin/manageUsers");
    });
  }
});

//---------*Category*-------//
router.get("/manageCategory", function (req, res) {
  userHelpers.findCategory(req.body, (results) => {
    if (results) {
      res.render("manageCategory", { results: results });
    }
  });
});

router.get("/addCategory", function (req, res) {
  res.render("addCategory");
});

router.post("/addCategory", function (req, res) {
  userHelpers.addCategory(req.body, (results) => {
    if (results) {
      res.redirect("/admin/manageCategory");
    } else {
      res.render("addCategory");
    }
  });
});

router.get("/editCategory/", function (req, res) {
  var name = req.query.name;
  res.render("editCategory", { name: name });
});

router.post("/editCategory/", function (req, res) {
  userHelpers.editCategory(req.body, req.query, (results) => {
    if (results) {
      res.redirect("/admin/manageCategory");
    }
  });
});

router.get("/removeCategory/", function (req, res) {
  userHelpers.removeCategory(req.query, (results) => {
    if (results) {
      res.redirect("/admin/manageCategory");
    }
  });
});

//-----*Products*------//
router.get("/manageProducts", function (req, res) {
  userHelpers.findProducts(req.body, (results) => {
    if (results) {
      res.render("manageProducts", { results: results });
    }
  });
});

router.get("/addProducts", function (req, res) {
  userHelpers.findCategory(req.body, (results) => {
    if (results) {
      res.render("addProducts", { results: results });
    }
  });
});

router.post("/addProducts", function (req, res) {
  userHelpers.addProducts(req.body, (id) => {
    if (req.body.image1) {
      const path = "./public/product_images/" + id + ".jpg";
      const imgdata = req.body.image1;
      const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "");
      fs.writeFileSync(path, base64Data, { encoding: "base64" });
      res.redirect("/admin/manageProducts");
    } else {
      let image = req.files.image2;
      image.mv("./public/product_images/" + id + ".jpg");
      res.redirect("/admin/manageProducts");
    }
  });
});

router.post("/cropped", function (req, res) {
   res.json('success')
});

router.get("/editProducts", function (req, res) {
  userHelpers.findSingleProducts(req.query, (results) => {
    if (results) {
      userHelpers.findCategory(req.body, (category) => {
        if (category) {
          res.render("editProducts", { results, category });
        }
      });
    }
  });
});

router.post("/editProducts/", function (req, res) {
  userHelpers.editProducts(req.body, req.query, (result) => {
    if (result) {
      if (req.body.image1) {
        const path = "./public/product_images/" + req.query.id + ".jpg";
        const imgdata = req.body.image1;
        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "");
        fs.writeFileSync(path, base64Data, { encoding: "base64" });
        res.redirect("/admin/manageProducts");
      } else {
        let image = req.files.image2;
        image.mv("./public/product_images/" + req.query.id + ".jpg");
        res.redirect("/admin/manageProducts");
      }
    }
  });
});

router.get("/removeProducts", function (req, res) {
  userHelpers.removeProducts(req.query, (results) => {
    if (results) {
      res.redirect("/admin/manageProducts");
    }
  });
});

//-------*Order*---------//
router.get('/manageOrders', function(req, res) {
  userHelpers.findAllOrders(req.body,async(orders)=>{
    let canceled = await userHelpers.getAllCanceledOrders(
    );
    if(orders){ 
       res.render('manageOrders',{orders,canceled})
    }
  })

});

router.get("/adminCancelOrder/", (req, res) => {
  if (req.session.adminloggedIn) {
    userHelpers.admincancelOrder(req.query.id).then((response) => {
      res.redirect("/admin/manageOrders");
    });
  } else {
    res.redirect('/admin');
  }
}); 

router.get("/viewOrderProduct/",async (req, res) => {
  let products = await userHelpers.viewOrderProduct(req.query.id);
  res.render("viewOrderProduct", { products });
});

router.get("/salesReport", (req, res) => {
   res.render('salesReport')
});

module.exports = router;
