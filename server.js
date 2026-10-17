require("dotenv").config()
const app = require('./src/app.js')
const { connect } = require('./src/config/db')

connect()


app.listen(3000,()=>{
    console.log("Server is running in the port number 3000")
})