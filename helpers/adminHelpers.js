var db=require('../config/connection')
var collection=require('../config/collections')  
module.exports={
    doLogin:async(userData,callback)=>{
       var data=await db.get().collection(collection.admin_collections).findOne({mail:userData.mail,pass:userData.pass})
        callback(data)
      
    }
}