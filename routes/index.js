const { response } = require("express");
var express = require("express");
const session = require("express-session");
const { restart } = require("nodemon");
var router = express.Router();
var userHelpers = require("../helpers/userHelpers");
require("dotenv").config();
const fast2sms = require("fast-two-sms");
const paypal = require("paypal-rest-sdk");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AV3H0ymVkcQdyCG0N2mImQg_iBH5U6Wym-FsOfp8nHwHEZzzYUpO1tcefbDYRkJwAhkbkAltlPrC1Wbl",
  client_secret:
    "EF3dJwS-gsFQjqgxWFWXd8TA1hQ1XS4m80JNmFmUs5hDUjEPhCmKIcsVkKtPmFBIcnsy3Bdk8IrU_d1_",
});
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

router.get("/signUp/", function (req, res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (req.session.userloggedIn) {
    res.redirect("/users");
  } else { 
  userHelpers.findCoupons((coupon) => {
    res.render("signUp", { suggested: req.query.referral,coname:coupon[0].coname});
  })
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
      let used = "MailId is already used.";
      res.render("signUp", { used });
    } else {
      userHelpers.findMobile(req.body, (response) => {
        if (response) {
          let used = "Mobile number is already used.";
          res.render("signUp", { used });
        } else {
            userHelpers.dosignUp(req.body,(results) => {
              if (results) {
                res.redirect("/login");
              } else {
                res.redirect("/signUp");
              }
            });
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
          req.session.userId = response._id;
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

router.get("/otpPage", (req, res) => {
  res.render("otpLogin");
});

router.post("/sendOtp", async (req, res) => {
  var otp = req.body.OTP;
  var mob = req.body.mobile;

  let response = await fast2sms.sendMessage({
    authorization: process.env.API_KEY,
    message: otp,
    numbers: [mob],
  });
  res.json(response.return);
});

router.post("/checkOtp", (req, res) => {
  var originalOtp = req.body.OtpOrginal;
  var userOtp = req.body.otp;
  if (originalOtp == userOtp) {
    userHelpers.findUser(req.body.mobile, (response) => {
      if (response[0]) {
        req.session.userloggedIn = true;
        req.session.user = response[0];
        req.session.userId = response[0]._id;
        res.redirect("/users");
      } else {
        var err = "Mobile number not registered";
        res.render("otpLogin", { err });
      }
    });
  } else {
    var err = "OTP not matching";
    res.render("otpLogin", { err });
  }
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
          var userId = await req.session.user._id;
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
          let total = await userHelpers.getTotalAmount(req.session.user._id);
          res.render("checkout", { total, user: req.session.user });
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
          req.session.total = req.body.total;
          let total = req.session.total
          userHelpers.checkout(req.body, products, total).then((orderId) => {
            if (req.body["payment_method"] === "COD") {
              res.json({ codSuccess: true });
            } else if (req.body["payment_method"] == "razorpay") {
              userHelpers.generateRazorpay(orderId, total).then((response) => {
                if (response) {
                  res.json(response);
                }
              });
            } else if (req.body["payment_method"] == "paypal") {
              req.session.total = req.body.total;
              req.session.orderId = orderId;
              const create_payment_json = {
                intent: "sale",
                payer: {
                  payment_method: "paypal",
                },
                redirect_urls: {
                  return_url: "http://localhost:3000/successPaypal",
                  cancel_url: "http://localhost:3000/cancel",
                },
                transactions: [
                  {
                    item_list: {
                      items: [
                        {
                          name: "Red Sox Hat",
                          sku: "001",
                          price: req.session.total,
                          currency: "USD",
                          quantity: 1,
                        },
                      ],
                    },
                    amount: {
                      currency: "USD",
                      total: req.session.total,
                    },
                    description: "Hat for the best team ever",
                  },
                ],
              };

              paypal.payment.create(
                create_payment_json,
                function (error, payment) {
                  if (error) {
                    throw error;
                  } else {
                    for (let i = 0; i < payment.links.length; i++) {
                      if (payment.links[i].rel === "approval_url") {
                        res.json({ paypalConnection: payment.links[i].href });
                      }
                    }
                  }
                }
              );
            }
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

router.get("/successPaypal", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: req.session.total,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
      }
    }
  );
  userHelpers.changePaymentStatus(req.session.orderId).then(() => {
    res.render("success");
  });
});

router.get("/cancel", (req, res) => res.redirect("/users"));

router.post("/placeOrder", async (req, res) => {
  userHelpers.checkUserStatus(req.session.userId, async (result) => {
    if (result) {
      if (result.status == "Block") {
        if (req.session.userloggedIn) {
          let products = await userHelpers.cartProducts(req.session.user._id);
          let total = 0;
          if (products.length > 0) {
            total = await userHelpers.getTotalAmount(req.session.user._id);
          }

          if (products) {
            res.render("placeOrder", {
              products,
              user: req.session.user._id,
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
          let orders = await userHelpers.getUserOrders(req.session.user._id);
          let canceled = await userHelpers.getCanceledOrders(
            req.session.user._id
          );
          res.render("orders", {
            orders,
            canceled,
            user: req.session.user._id,
          });
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

router.get("/viewOrderProduct/", (req, res) => {
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

router.post("/verifyPayment", (req, res) => {
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false, errMsg: "Error" });
    });
});


router.get("/viewOffers", (req, res) => {
  userHelpers
    .findOfferProducts(result => {
      userHelpers.findCatOfferProducts(response => {
        res.render('offers',{result,response})
      });
    })
});


module.exports = router;
