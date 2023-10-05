const app = require('./app')
// const dotenv = require('dotenv')
//for database
const connectDatabase = require('./config/database')
const http = require("http");

const { nextDayAttendance } = require('./controllers/attendanceControllers')
var cron = require('node-cron');
//Handle Uncaught Exception

// console.log(a);  ## For Handling this type of uncaught exception

process.on('uncaughtException', error => {
    // console.log(`ERROR : ${err.message}`);
    console.log(`ERROR : ${error}`);
})

//Setting Up Config File
if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: 'backend/config/config.env' })

//Connecting Database
connectDatabase();
let servers = http.Server(app)


const server = servers.listen(process.env.PORT || 4000, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)

    cron.schedule('0 0 0 * * *', () => {
        nextDayAttendance();
      });
    //Handle Unhandled Promise Rejection

    process.on('unhandledRejection', err => {
        console.log(`ERROR : ${err.message}`);

    })
})
