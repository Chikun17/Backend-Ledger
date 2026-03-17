const mongoose = require('mongoose')

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Database connected successfully")
    })
    .catch(err=>{
        console.log("Error connecting to database")
        process.exit(1)
    })
}

module.exports=connectToDB
