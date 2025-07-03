const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
//dotenv path
dotenv.config({path: './config/config.env'});


connectDB();
const app = express();

// Routers bootcamp
const bootcamp = require('./routes/bootcamp');

//body parser
app.use(express.json());


// dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//moount routers
app.use('/api/bootcamp', bootcamp);
// error middleware
app.use(errorHandler);

 


const PORT = process.env.PORT || 5000;

 const server =app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.bold));

// handle unhandled promise rejections

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    //close server and exit process
    server.close(() => process.exit(1))
})