const mongoose = require('mongoose');

//Database Connection
//mongodb://localhost:27017/EASYHR
const connectDatabase = () => {
    mongoose.connect("mongodb+srv://ajink3994:ajinkya2022@cluster0.mnc5ejc.mongodb.net/easy-hr", {

        //For avoid Warnings
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }).then(con => {
        console.log(`MongoDb Database connect with HOST : ${con.connection.host}`)
    })
}

module.exports = connectDatabase
