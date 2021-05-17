const { response } = require("express");
var express = require("express");
const session = require("express-session");
const { restart } = require("nodemon");
var router = express.Router();
var userHelpers = require("../helpers/userHelpers");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  userHelpers.findProducts(req.body, (results) => {
    if (results) {
      userHelpers.findCategory(req.body, (result) => {
        if (results) {
          res.render("index", {
            title: "Home Page",
            results,
            result,
            value: req.session.error,
          });
          req.session.error = false;
        }
      });
    }
  });
});

router.get("/signUp", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (req.session.userloggedIn) {
    res.redirect("/users");
  } else {
    res.render("signUp");
  }
});

router.get("/logIn", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (req.session.userloggedIn) {
    res.redirect("/users");
  } else {
    res.render("login");
  }
});

router.get("/contact", function (req, res) {
  res.render("contact");
});

router.get("/about", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (req.session.userloggedIn) {
    res.redirect("/users");
  } else {
    res.render("about");
  }
  res.redirect("/");
});

router.post("/signUp", function (req, res) {
  userHelpers.findMail(req.body, (result) => {
    if (result) {
      let usedMail = "This mailId is already used. Please choose another.";
      res.render("signUp", { usedMail });
    } else {
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
      userHelpers.checkStatus(req.body, (result) => {
        if (result.status == "Block") {
          req.session.userloggedIn = true;
          req.session.user = response;
          req.session.userId = response.data._id;
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
});

router.get("/logout", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (req.session.userloggedIn) {
    req.session.userloggedIn = false;
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});

router.get("/addToCart/:id", (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, async (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          var userId = await req.session.user.data._id;
          userHelpers.addToCart(userId, req.params.id).then(() => {
            res.json({ status: true });
          });
        } else {
          res.json({ status: false });
        }
      } else {
        req.session.userloggedIn = false;
        res.json({ status: false });
      }
    } else {
      req.session.userloggedIn = false;
      res.json({ status: false });
    }
  });
});

router.get("/checkout", async (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, async (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          let total = await userHelpers.getTotalAmount(
            req.session.user.data._id
          );
          res.render("checkout", { total, user: req.session.user.data });
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

router.post("/checkoutSubmit", (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, async (result) => {
    if (result) {
      if (result.status == "Block") {
        res.header(
          "Cache-Control",
          "private, no-cache, no-store, must-revalidate"
        );
        if (req.session.userloggedIn) {
          let products = await userHelpers.getCartProductList(req.body.userid);
          let total = await userHelpers.getTotalAmount(req.body.userid);
          userHelpers.checkout(req.body, products, total).then((response) => {
            res.json({ status: true });
          });
        } else {
          res.json({ status: false });
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

router.post("/placeOrder", async (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, async (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          let products = await userHelpers.cartProducts(
            req.session.user.data._id
          );
          let total = await userHelpers.getTotalAmount(
            req.session.user.data._id
          );
          if (products) {
            res.render("placeOrder", {
              products,
              user: req.session.user.data._id,
              total,
            });
          } else {
            res.redirect("/users");
          }
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

router.get("/viewOrders", async (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, async (result) => {
    if (result) {
      if (result.status == "Block") {
        res.header(
          "Cache-Control",
          "private, no-cache, no-store, must-revalidate"
        );
        if (req.session.userloggedIn) {
          let orders = await userHelpers.getUserOrders(
            req.session.user.data._id
          );
          let canceled = await userHelpers.getCanceledOrders(
            req.session.user.data._id
          );
          res.render("orders", { orders,canceled, user: req.session.user.data._id });
        } else {
          res.redirect("users");
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

router.post("/changeProductQuantity", (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, async (result) => {
    if (result) {
      if (result.status == "Block") {
        res.header(
          "Cache-Control",
          "private, no-cache, no-store, must-revalidate"
        );
        if (req.session.userloggedIn) {
          userHelpers.changeProductQuantity(req.body).then(async (response) => {
            response.total = await userHelpers.getTotalAmount(req.body.id);
            res.json(response);
          });
        } else {
          res.json(false);
        }
      } else {
        req.session.userloggedIn = false;
        res.json(false);
      }
    } else {
      req.session.userloggedIn = false;
      res.json(false);
    }
  });
});

router.post("/removeCartProduct", (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, async (result) => {
    if (result) {
      if (result.status == "Block") {
        res.header(
          "Cache-Control",
          "private, no-cache, no-store, must-revalidate"
        );
        if (req.session.userloggedIn) {
          userHelpers.removeCartProduct(req.body).then((response) => {
            res.json(response);
          });
        } else {
          res.json(false);
        }
      } else {
        req.session.userloggedIn = false;
        res.json(false);
      }
    } else {
      req.session.userloggedIn = false;
      res.json(false);
    }
  });
});

router.get("/success", (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          res.render("success");
        } else {
          res.redirect("/");
        }
      } else {
        req.session.userloggedIn = false;
        res.json(false);
      }
    } else {
      req.session.userloggedIn = false;
      res.json(false);
    }
  });
});

router.get("/viewOrderProduct/",(req, res) => {
  userHelpers.checkUserStatus(req.session.userId, async (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          let products = await userHelpers.viewOrderProduct(req.query.id);
          res.render("viewOrderProduct", { products });
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

router.get("/cancelOrder/", (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          userHelpers.cancelOrder(req.query.id).then((response) => {
            res.redirect("/viewOrders");
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

module.exports = router;
