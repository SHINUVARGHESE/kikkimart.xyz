const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    const url="mongodb+srv://shinuvarghese:shinu01997@cluster0.ind7u.mongodb.net/kikkimart?retryWrites=true&w=majority";
    const dbname='kikkimart'

    mongoClient.connect(url,{ useUnifiedTopology: true },(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.get=function(){
    return state.db
}
