var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
const { response } = require("express");
const Razorpay = require('razorpay');
const { request } = require("http");
var instance = new Razorpay({
  key_id: 'rzp_test_B1Edfkjazm7n03',
  key_secret: 'rPiblaVGYYLwwEOP9ktPdKU6',
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
  findUser: async(mobile, callback) => {
  var data = await db.get()
      .collection(collection.user_collections) 
      .find({mobile:mobile})
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
  checkUserStatus: async (userId, callback) => {
    var data = await db
      .get()
      .collection(collection.user_collections)
      .findOne({ _id:objectId(userId) });
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
      .insertOne({pname:product.pname,category:product.category,price:parseInt(product.price),discription:product.discription,offerPrice:product.offerPrice})
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
  editProducts: async (body, query, callback) => {
    var data = await db
      .get()
      .collection(collection.product_collections)
      .updateOne(
        { _id: objectId(query.id) },
        {
          $set: {
            pname: body.pname,
            price:parseInt(body.price),
            category: body.category,
            discription: body.discription,
          },
        }
      );
    callback(data);
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
    let proObj={
      item:objectId(productId),
      quantity:1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.cart_collections)
        .findOne({ user: objectId(userId) });

      if (userCart) {

        let proExist=userCart.products.findIndex(product=> product.item==productId)
        if(proExist != -1){
          db.get().collection(collection.cart_collections)
          .updateOne({user:objectId(userId),'products.item':objectId(productId)},
          {
              $inc:{'products.$.quantity':1}
          }
          ).then(()=>{
              resolve()
          })
        }else{
         db.get()
            .collection(collection.cart_collections)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products:proObj},
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
        if(userCart){

      let cartItem = await db
        .get()
        .collection(collection.cart_collections)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },{
            $unwind:'$products'
          },
          {
              $project:{
                item:'$products.item',
                quantity:'$products.quantity'
              }
          },
          {
            $lookup:{
                from:collection.product_collections,
                localField:'item',
                foreignField:'_id',
                as:'product'
            } 
          },
          {
            $project:{
              item:1,quantity:1,product:{$arrayElemAt:["$product",0]}
            }
          }
        ]).toArray()
        resolve(cartItem)
      }else{
        resolve()
      }  
    });

  },
  findCount: async (userId, callback) => {
    var count = 0
    var data = await db.get().collection(collection.cart_collections).findOne({user:objectId(userId)})
    if(data){
      count = data.products.length
    }
    callback(count)
  },
  changeProductQuantity:  (details) => {
    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)

    return new Promise((resolve, reject) => {
      if(details.count==-1 && details.quantity==1){
         db.get().collection(collection.cart_collections)
         .updateOne({_id:objectId(details.cart)},
         {
           $pull:{products:{item:objectId(details.product)}}
         }
         ).then((response)=>{
              resolve({removeProduct:true})
         })
      }else{
      db.get().collection(collection.cart_collections)
      .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
      {
          $inc:{'products.$.quantity':details.count}
      }
      ).then((response)=>{
          resolve({status:true})
      })
     }
    });
  },
  removeCartProduct:(details) => {
  return new Promise((resolve, reject) => {
    db.get().collection(collection.cart_collections)
         .updateOne({_id:objectId(details.cart)},
         {
           $pull:{products:{item:objectId(details.product)}}
         }
        ).then((response)=>{
            resolve({removeProduct:true})
        })
    })
  },

  getTotalAmount:(userId) => {
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.cart_collections)
        .findOne({ user: objectId(userId) });
        if(userCart){

      let total = await db
        .get()
        .collection(collection.cart_collections)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },{
            $unwind:'$products'
          },
          {
              $project:{
                item:'$products.item',
                quantity:'$products.quantity'
              }
          },
          {
            $lookup:{
                from:collection.product_collections,
                localField:'item',
                foreignField:'_id',
                as:'product'
            } 
          },
          {
            $project:{
              item:1,quantity:1,product:{$arrayElemAt:["$product",0]}
            }
          },
          {
            
            $group :{
              _id:null,
              total:{$sum:{$multiply:['$quantity','$product.price']}}
            }
          }
        ]).toArray()
        resolve(total[0].total)
      }else{
        resolve(false)
      }  
    });

  }, 
  checkout:(order,products,total) => {
    return new Promise(async (resolve, reject) => {
        let status = order['payment_method']==='COD'?'placed':'pending'
        let currentDate = new Date()
        let orderObj={
            deliveryDetails:{
              mobile:order.mobile,
              address:order.address,
              pincode:order.pincode
            },
            userId:objectId(order.userid),
            paymentMethod:order['payment_method'],
            products:products,
            totalAmount:total,
            date:currentDate.toDateString(),
            status:status
        }

        db.get().collection(collection.order_collections).insertOne(orderObj).then((response)=>{
          db.get().collection(collection.cart_collections).removeOne({user:objectId(order.userid)})
          resolve(response.ops[0]._id)
        })
    })
  },

  getCartProductList:(userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.cart_collections).findOne({user:objectId(userId)})
      resolve(cart.products)
   
    })
  },

  getUserOrders:(userId) => {
    return new Promise( async(resolve,reject)=>{
        let orders=await db.get().collection(collection.order_collections)
        .find({userId:objectId(userId),status:'placed'}).toArray()
        resolve(orders)
    })
  },
  getCanceledOrders:(userId) => {
    return new Promise( async(resolve,reject)=>{
        let orders=await db.get().collection(collection.order_collections)
        .find({userId:objectId(userId),status:'Canceled'}).toArray()
        resolve(orders)
    })
  },
  getAllCanceledOrders:(userId) => {
    return new Promise( async(resolve,reject)=>{
        let orders=await db.get().collection(collection.order_collections)
        .find({status:'Canceled'}).toArray()
        resolve(orders)
    })
  },
  cancelOrder:(orderId) => {
    return new Promise( async(resolve,reject)=>{
        let orders=await db.get().collection(collection.order_collections).updateOne({_id:objectId(orderId)},
        {
          $set: {
            status: 'Canceled',
          },
        })
        
        resolve(orders)
      })
  },

  admincancelOrder:(orderId) => {
    return new Promise( async(resolve,reject)=>{
        let orders=await db.get().collection(collection.order_collections).updateOne({_id:objectId(orderId)},
        {
          $set: {
            status: 'Canceled',
          },
        })
        
        resolve(orders)
      })
  },

  viewOrderProduct:(orderId) => {
    return new Promise( async(resolve,reject)=>{
      let orderItem = await db
      .get()
      .collection(collection.order_collections)
      .aggregate([
        {
          $match: { _id: objectId(orderId) },
        },{
          $unwind:'$products'
        },
        {
            $project:{
              item:'$products.item',
              quantity:'$products.quantity'
            }
        },
        {
          $lookup:{
              from:collection.product_collections,
              localField:'item',
              foreignField:'_id',
              as:'product'
          } 
        },
        {
          $project:{
            item:1,quantity:1,product:{$arrayElemAt:["$product",0]}
          }
        }
      ]).toArray()
      resolve(orderItem)
    })
  },

  findSingleUser: async (userId, callback) => {
    var data = await db
      .get()
      .collection(collection.user_collections)
      .find({_id:objectId(userId)})
      .toArray();
    callback(data);
  },

  editUserProfile:(userId,data,callback) => {
   var data= db.get()
      .collection(collection.user_collections)
      .updateOne({_id:objectId(userId)},
      {
          $set:{
            fname:data.fname,
            lname:data.lname,
            occupation:data.occupation,
            country:data.country,
            mobile:data.mobile,
            mail:data.mail
          }
      })
      callback(data)
  },
  
  findAllOrders:async(body,callback)=>{
    var data = await db
      .get()
      .collection(collection.order_collections)
      .find({status:'placed'})
      .toArray();
    callback(data);
  },

  generateRazorpay:(orderId,total)=>{
    return new Promise((resolve,reject)=>{
      var options = {
        amount: total*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: ""+orderId 
      };
      instance.orders.create(options, function(err, order) {
        resolve(order)
      });
    })
  },

  verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
      const crypto = require('crypto');
      let hmac =crypto.createHmac('sha256','rPiblaVGYYLwwEOP9ktPdKU6')
      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      hmac=hmac.digest('hex')
      if(hmac==details['payment[razorpay_signature]']){
          resolve()
      }else{
        reject()
      }
    })
  },           

  changePaymentStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.order_collections).updateOne({_id:objectId(orderId)},
      {
          $set:{
            status:'placed'
          }
      }).then(()=>{
         resolve()
      })
    })
  },

  findAddress:(usersId,data)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(data.address+"").findOne({userId:usersId+"",status:data.address+""}).then((response) => {
        resolve(response);
      });

    })

  },

  addAddress:(body,query)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(query.address).insertOne({userId:query.id,status:query.address,address:body}).then((response) => {
        resolve(response.ops[0]);
      });

    })

  },
  updateAddress:(usersId,body,query)=>{
    return new Promise((resolve,reject)=>{
      if(query.address=='address1'){
      db.get().collection('address1').updateOne({userId : usersId+"",status:'address1'},{
        $set: {
          address: body
        },
      }).then((response) => {
        resolve(response);
      });
     }else if(query.address=='address2'){
      db.get().collection('address2').updateOne({ 
        userId : usersId+"",status:'address2'},{
        $set: {
          address: body
        },
      }).then((response) => {
        resolve(response);
      });
    }else{
      db.get().collection('address3').updateOne({
        userId : usersId+"",status:'address3'},{
        $set: {
          address: body
        },
      }).then((response) => {
        resolve(response);
      });
    }
    })

  },
  
  removeAddress:(usersId,add)=>{
    return new Promise((resolve,reject)=>{
      if(add=='address1'){
        db.get().collection('address1').deleteOne({userId:usersId+""}).then((response) => {
          resolve(response);
        });
       }else if(add=='address2'){
        db.get().collection('address2').deleteOne({
          status:'address2',userId: usersId+""},{userId:usersId+""}).then((response) => {
          resolve(response);
        });
      }else if(add=='address3'){
        db.get().collection('address3').deleteOne({
          status:'address3',userId: usersId+""},{userId:usersId+""}).then((response) => {
          resolve(response);
        });
      }
    })
  }
};
