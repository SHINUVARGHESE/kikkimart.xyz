var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
const { response } = require("express");
const Razorpay = require("razorpay");
const { request } = require("http");
const { promises } = require("dns");
var instance = new Razorpay({
  key_id: "rzp_test_B1Edfkjazm7n03",
  key_secret: "rPiblaVGYYLwwEOP9ktPdKU6",
});
module.exports = {
  dosignUp: (userData, callback) => {
    return new Promise(async (resolve, reject) => {
      userData.pass = await bcrypt.hash(userData.pass, 10);
      db.get()
        .collection(collection.user_collections)
        .insertOne(userData)
        .then((data) => {
          callback(data.ops[0]);
        });
    });
  },

  fbUserSignUp: (userData,referralCode, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.user_collections)
        .insertOne({fname:userData.first_name,lname:userData.last_name,mail:userData.email,status:"Block",referral:referralCode})
        .then((data) => {
          callback(data.ops[0]);
        });
    });
  },

  doUserSignUp: (userData,referralCode, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.user_collections)
        .insertOne({fname:userData.given_name,lname:userData.family_name,mail:userData.email,status:"Block",referral:referralCode})
        .then((data) => {
          callback(data.ops[0]);
        });
    });
  },
  doLogin: async (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let data = await db
        .get()
        .collection(collection.user_collections)
        .findOne({ mail: userData.mail });
      if (data) {
        bcrypt.compare(userData.pass, data.pass).then((status) => {
          if (status) {
            response.data = data;
            response.status = true;
            resolve(response.data);
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },

  findUser: async (mobile, callback) => {
    var data = await db
      .get()
      .collection(collection.user_collections)
      .find({ mobile: mobile })
      .toArray();
    callback(data);
  },
  findAllUsers: async (callback) => {
    var data = await db
      .get()
      .collection(collection.user_collections)
      .find()
      .toArray();
    callback(data);
  },
  adminfindUser: async (body, callback) => {
    var data = await db
      .get()
      .collection(collection.user_collections)
      .find()
      .toArray();
    callback(data);
  },
  checkStatus: async (dummy, callback) => {
    var data = await db
      .get()
      .collection(collection.user_collections)
      .findOne({ mail: dummy.mail });
    callback(data);
  },
  checkNewStatus: async (dummy, callback) => {
    var data = await db 
      .get()
      .collection(collection.user_collections)
      .findOne({ mail: dummy.email });
    callback(data);
  },
  checkUserStatus: async (userId, callback) => {
    var data = await db
      .get()
      .collection(collection.user_collections)
      .findOne({ _id: objectId(userId) });
    callback(data);
  },
  removeUser: async (query, callback) => {
    var response = await db
      .get()
      .collection(collection.user_collections)
      .deleteOne({ _id: objectId(query.id) });
    callback(response);
  },
  blockUser: async (query, stat, callback) => {
    var response = await db
      .get()
      .collection(collection.user_collections)
      .updateOne(
        { _id: objectId(query.id) },
        {
          $set: {
            status: stat,
          },
        }
      );
    callback(response);
  },

  addCategory: (category, callback) => {
    db.get()
      .collection(collection.category_collections)
      .insertOne({ cname: category.cname })
      .then((data) => {
        callback(data.ops[0]);
      });
  },
  editCategory: async (new_category, old_category, callback) => {
    var response = await db
      .get()
      .collection(collection.category_collections)
      .updateOne(
        { cname: old_category.name },
        {
          $set: {
            cname: new_category.cname,
          },
        }
      );
    callback(response);
  },
  findCategory: async (dummy, callback) => {
    var data = await db
      .get()
      .collection(collection.category_collections)
      .find()
      .toArray();
    callback(data);
  },
  removeCategory: async (query, callback) => {
    var response = await db
      .get()
      .collection(collection.category_collections)
      .deleteOne({ cname: query.name });
    callback(response);
  },
  removeCollection: (query, callback) => {
    db.get()
      .collection(query.name)
      .drop()
      .then((data) => {
        callback(data);
      });
  },

  addProducts: (product, callback) => {
    db.get()
      .collection(collection.product_collections)
      .insertOne({
        pname: product.pname,
        category: product.category,
        price: parseInt(product.price),
        discription: product.discription,
      })
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  findProducts: async (product, callback) => {
    var data = await db
      .get()
      .collection(collection.product_collections)
      .find()
      .toArray();
    callback(data);
  },
  findOfferProducts: async (callback) => {
    var data = await db
      .get()
      .collection(collection.offers_collections)
      .find()
      .project()
      .toArray();
    callback(data);
  },
  findCatOfferProducts: async (callback) => {
    var data = await db
      .get()
      .collection(collection.categoryOffers_collections)
      .find()
      .project()
      .toArray();
    callback(data);
  },
  removeProducts: async (query, callback) => {
    var data = await db
      .get()
      .collection(collection.product_collections)
      .deleteOne({ _id: objectId(query.id) });
    callback(data);
  },
  findSingleProducts: async (query, callback) => {
    var data = await db
      .get()
      .collection(collection.product_collections)
      .find({ _id: objectId(query.id) })
      .project()
      .toArray();
    callback(data);
  },
  findOffers: async (query, callback) => {
    var data = await db
      .get()
      .collection(collection.offers_collections)
      .find({ _id: objectId(query.id) })
      .project()
      .toArray();
    callback(data);
  },
  findCatOffers: async (query, callback) => {
    var data = await db
      .get()
      .collection(collection.categoryOffers_collections)
      .find({ _id: objectId(query.id) })
      .toArray();
    callback(data);
  },
  findProductDetails: async (proName, callback) => {
    var data = await db
      .get()
      .collection(collection.product_collections)
      .findOne({ pname: proName });
    callback(data);
  },
  editProducts: async (body, query, callback) => {
    var data = await db
      .get()
      .collection(collection.product_collections)
      .updateOne(
        { _id: objectId(query.id) },
        {
          $set: {
            pname: body.pname,
            price: parseInt(body.price),
            category: body.category,
            discription: body.discription,
          },
        }
      );
    callback(data);
  },

  addOffers: (body, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.offers_collections)
        .insertOne(body)
        .then((result) => {
          resolve(result);
        });
    });
  },

  addCatOffers: (body, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.categoryOffers_collections)
        .insertOne(body)
        .then((result) => {
          resolve(result);
        });
    });
  },
  updateProduct: async (body, callback) => {
    var data = await db
      .get()
      .collection(collection.product_collections)
      .updateOne(
        { _id: objectId(body.proId) },
        {
          $set: {
            price: body.offerPrice - 0,
            oldPrice: body.price - 0,
            status: "offer",
          },
        }
      );
    callback(data);
  },

  removeFromPro: async (query, product, callback) => {
    var data = await db
      .get()
      .collection(collection.product_collections)
      .updateOne(
        { _id: objectId(product.proId) },
        {
          $set: {
            price: product.price,
            oldPrice: "",
            status: "",
          },
        }
      );
    callback(data);
  },

  updateCatOffers: async (body, callback) => {
    var data = await db
      .get()
      .collection(collection.categoryOffers_collections)
      .updateOne(
        { _id: objectId(body.id) },
        {
          $set: {
            offerPersentage: body.offerPersentage,
            endingTime: body.endingTime,
          },
        }
      );
    callback(data);
  },

  updateOffers: async (body, callback) => {
    var data = await db
      .get()
      .collection(collection.offers_collections)
      .updateOne(
        { _id: objectId(body.id) },
        {
          $set: {
            offerPrice: body.offerPrice,
            endingTime: body.endingTime,
          },
        }
      );
    callback(data);
  },

  removeOffers: async (product, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.offers_collections)
        .removeOne({
          _id: objectId(product.id),
        })
        .then((result) => {
          resolve(result);
        });
    });
  },

  removeCatOffers: async (category, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.categoryOffers_collections)
        .removeOne({
          _id: objectId(category.id),
        })
        .then((result) => {
          resolve(result);
        });
    });
  },

  findMail: (dummy, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.user_collections)
        .findOne({ mail: dummy.mail })
        .then((data) => {
          callback(data);
        });
    });
  },

  findUserMail: (dummy, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.user_collections)
        .findOne({ mail: dummy.email })
        .then((data) => {
          callback(data);
        });
    });
  },

  findMobile: (dummy, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.user_collections)
        .findOne({ mobile: dummy.mobile })
        .then((data) => {
          callback(data);
        });
    });
  },
  addToCart: (userId, productId) => {
    let proObj = {
      item: objectId(productId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.cart_collections)
        .findOne({ user: objectId(userId) });

      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == productId
        );
        if (proExist != -1) {
          db.get()
            .collection(collection.cart_collections)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(productId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.cart_collections)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };

        db.get()
          .collection(collection.cart_collections)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  cartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.cart_collections)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let cartItem = await db
          .get()
          .collection(collection.cart_collections)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.product_collections,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
          ])
          .toArray();
        resolve(cartItem);
      } else {
        resolve();
      }
    });
  },
  findCount: async (userId, callback) => {
    var count = 0;
    var data = await db
      .get()
      .collection(collection.cart_collections)
      .findOne({ user: objectId(userId) });
    if (data) {
      count = data.products.length;
    }
    callback(count);
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.cart_collections)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.cart_collections)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  removeCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.cart_collections)
        .updateOne(
          { _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.cart_collections)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let total = await db
          .get()
          .collection(collection.cart_collections)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.product_collections,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
              },
            },
          ])
          .toArray();
          if(total.length!=0){
              resolve(total[0].total);
          }else{
            resolve(0)
          }
      } else {
        resolve(false);
      }
    });
  },
  checkout: (order, products, total) => {
    return new Promise(async (resolve, reject) => {
      let status = order["payment_method"] === "COD" ? "placed" : "pending";
      let currentDate = new Date();
      let orderObj = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode,
        },
        userId: objectId(order.userid),
        paymentMethod: order["payment_method"],
        products: products,
        totalAmount: total,
        date: currentDate,
        status: status,
      };

      db.get()
        .collection(collection.order_collections)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.cart_collections)
            .removeOne({ user: objectId(order.userid) });
          resolve(response.ops[0]._id);
        });
    });
  },

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.cart_collections)
        .findOne({ user: objectId(userId) });
      resolve(cart.products);
    });
  },

  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.order_collections)
        .find({ userId: objectId(userId), status:{$in: ['placed', 'Shipped','Delivered']}})
        .toArray();
      resolve(orders);
    });
  },
  getCanceledOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.order_collections)
        .find({ userId: objectId(userId), status: "Canceled" })
        .toArray();
      resolve(orders);
    });
  },
  getAllCanceledOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.order_collections)
        .find({ status: "Canceled" })
        .toArray();
      resolve(orders);
    });
  },
  cancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.order_collections)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Canceled",
            },
          }
        );

      resolve(orders);
    });
  },

  admincancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.order_collections)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Canceled",
            },
          }
        );

      resolve(orders);
    });
  },

  viewOrderProduct: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItem = await db
        .get()
        .collection(collection.order_collections)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.product_collections,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(orderItem);
    });
  },

  findSingleUser: async (userId, callback) => {
    var data = await db
      .get()
      .collection(collection.user_collections)
      .find({ _id: objectId(userId) })
      .toArray();
    callback(data);
  },

  editUserProfile: (userId, data, callback) => {
    var data = db
      .get()
      .collection(collection.user_collections)
      .updateOne(
        { _id: objectId(userId) },
        {
          $set: {
            fname: data.fname,
            lname: data.lname,
            occupation: data.occupation,
            country: data.country,
            mobile: data.mobile,
            mail: data.mail,
          },
        }
      );
    callback(data);
  },

  findAllOrders: async (body, callback) => {
    var data = await db
      .get()
      .collection(collection.order_collections)
      .find({status:{$in: ['placed', 'Shipped','Delivered']}})
      .toArray(); 
    callback(data);
  },

  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        resolve(order);
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "rPiblaVGYYLwwEOP9ktPdKU6");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.order_collections)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  findAddress: (usersId, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(data.address + "")
        .findOne({ userId: usersId + "", status: data.address + "" })
        .then((response) => {
          resolve(response);
        });
    });
  },

  addAddress: (body, query) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(query.address)
        .insertOne({ userId: query.id, status: query.address, address: body })
        .then((response) => {
          resolve(response.ops[0]);
        });
    });
  },
  updateAddress: (usersId, body, query) => {
    return new Promise((resolve, reject) => {
      if (query.address == "address1") {
        db.get()
          .collection("address1")
          .updateOne(
            { userId: usersId + "", status: "address1" },
            {
              $set: {
                address: body,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      } else if (query.address == "address2") {
        db.get()
          .collection("address2")
          .updateOne(
            {
              userId: usersId + "",
              status: "address2",
            },
            {
              $set: {
                address: body,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      } else {
        db.get()
          .collection("address3")
          .updateOne(
            {
              userId: usersId + "",
              status: "address3",
            },
            {
              $set: {
                address: body,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      }
    });
  },

  removeAddress: (usersId, add) => {
    return new Promise((resolve, reject) => {
      if (add == "address1") {
        db.get()
          .collection("address1")
          .deleteOne({ userId: usersId + "" })
          .then((response) => {
            resolve(response);
          });
      } else if (add == "address2") {
        db.get()
          .collection("address2")
          .deleteOne(
            {
              status: "address2",
              userId: usersId + "",
            },
            { userId: usersId + "" }
          )
          .then((response) => {
            resolve(response);
          });
      } else if (add == "address3") {
        db.get()
          .collection("address3")
          .deleteOne(
            {
              status: "address3",
              userId: usersId + "",
            },
            { userId: usersId + "" }
          )
          .then((response) => {
            resolve(response);
          });
      }
    });
  },

  DetailedReport: (from) => {
    return new Promise((resolve, reject) => {
      let currentDate = new Date();
      var to = currentDate;
      db.get()
        .collection(collection.order_collections)
        .find({
          date: {
            $gte: new Date(from),
            $lt: new Date(to),
          },
        })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },

  dateSearch: async (body, callback) => {
    var result = await db
      .get()
      .collection(collection.order_collections)
      .find({
        date: {
          $gte: new Date(body.from),
          $lt: new Date(body.to),
        },
      })
      .toArray();
    callback(result);
  },

  addCoupon: (body, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.coupons_collections)
        .insertOne(body)
        .then((data) => {
          callback(data.ops[0]);
        });
    });
  },
  expireCoupon: (body, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.coupons_collections)
        .createIndex({ endingTime: 1 }, { expireAfterSeconds: 60 })
        .then((data) => {
          callback(data);
        });
    });
  },

  expireOffers: (body, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.offers_collections)
        .createIndex({ endingTime: 1 }, { expireAfterSeconds: 60 })
        .then((data) => {
          callback(data);
        });
    });
  },

  expireCatOffers: (body, callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.categoryOffers_collections)
        .createIndex({ endingTime: 1 }, { expireAfterSeconds: 60 })
        .then((data) => {
          callback(data);
        });
    });
  },

  editCoupon: (body, callback) => {
    var result = db
      .get()
      .collection(collection.coupons_collections)
      .updateOne(
        { _id: objectId(body.coId) },
        {
          $set: {
            coname: body.coname,
            code: body.code,
            redeemAmount: body.redeemAmount,
            endingTime: body.endingTime,
          },
        }
      );

    callback(result);
  },

  findCoupons: (callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.coupons_collections)
        .find()
        .toArray()
        .then((data) => {
          callback(data);
        });
    });
  },

  findSingleCoupons: (query,callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.coupons_collections)
        .find({ _id:objectId(query.id) })
        .toArray()
        .then((data) => {
          callback(data)
        });
    });
  },

  findUserCoupons: (body,callback) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.coupons_collections)
        .find({ code:body.couponCode })
        .toArray()
        .then((data) => {
         callback(data)
        });
    });
  },

  removeCoupon: async (query, callback) => {
    var data = await db
      .get()
      .collection(collection.coupons_collections)
      .deleteOne({ _id: objectId(query.id) });
    callback(data);
  },

  findReferral: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.user_collections)
        .findOne({ _id: objectId(userId) })
        .then((data) => {
          resolve(data);
        });
    });
  },

  findUserCoupon: (couponName) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.coupons_collections)
        .find({ coname: couponName })
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },

  findSuggested: (referral) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.user_collections)
        .find({ suggested: referral })
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },

  sales:(dummy) => {
    return new Promise(async (resolve, reject) => {
      var chart = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let year = new Date();
      var result = await db
        .get()
        .collection(collection.order_collections)
        .aggregate([
          {
            $match: {
              status: "placed",
              date: { $gte: new Date(`${year.getFullYear()}`) },
            },
          },
          {
            $group: {
              _id: { $month: "$date" },
              sales: { $sum: 1 },
              total: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
      for (let i = 0; i < result.length; i++) {
        chart[result[i]._id - 1] = result[i].total;
      }
      resolve(chart);
    });
  },

  revenue:(dummy) => {
    return new Promise(async (resolve, reject) => {
      var chart = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let year = new Date();
      var result = await db
        .get()
        .collection(collection.order_collections)
        .aggregate([
          {
            $match: {
              status: "placed",
              date: { $gte: new Date(`${year.getFullYear()}`) },
            },
          },
          {
            $group: {
              _id: { $month: "$date" },
              sales: { $sum: 1 },
              total: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
        for (let i = 0; i < result.length; i++) {
          chart[result[i]._id - 1] = result[i].total;
        }
      resolve(chart);
    });
  },

  searchProducts: (body) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.product_collections)
        .find({pname:body.searchValue})
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },

  changePassword: (body,email) => {
    return new Promise(async(resolve, reject) => {
      body.pass = await bcrypt.hash(body.pass, 10);
      db.get()
        .collection(collection.user_collections)
        .updateOne(
          {mail:email},
          {
            $set: {
              pass: body.pass,
            },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },

  changeStatus: async (body, callback) => {
    var response = await db
      .get()
      .collection(collection.order_collections)
      .updateOne(
        { _id: objectId(body.id) },
        {
          $set: {
            status: body.OrderStatus,
          },
        }
      );
    callback(response);
  },

};
