var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
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
            resolve(response);
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },
  findUser: async (dummy, callback) => {
    var data = await db
      .get()
      .collection(collection.user_collections)
      .find()
      .toArray();
    callback(data);
  },
  checkStatus: async (dummy, callback) => {
    var data = await db.get().collection(collection.user_collections).findOne({ mail: dummy.mail })
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
      .insertOne(product)
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
            price: body.Price,
            category: body.category,
            discription: body.discription,
          },
        }
      );
    callback(data);
  },
};
