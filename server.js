const express = require('express');
const path = require('path')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
// const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const colors = require('colors');
const errorHandler = require('./middleware/error');
//dotenv path
dotenv.config({path: './config/config.env'});


connectDB();
const app = express();

// Routers bootcamp
const bootcamp = require('./routes/bootcamp');
const course = require('./routes/course');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//body parserty
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Sanitize data
// app.use(mongoSanitize())-------------------------------

//api security
app.use(helmet())
// app.use(xss());---------------------------------

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max:100
})
app.use(limiter)
// app.use(hpp())-------------------------------------

//enable cors
app.use(cors())
//cookie parser
app.use(cookieParser())





// dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
// file uploading
app.use(fileupload())


//set static folder
app.use(express.static(path.join(__dirname, 'public')))

//moount routers
app.use('/api/bootcamp', bootcamp);
app.use('/api/courses', course);
app.use('/api/auth', auth);
app.use('/api/auth/users', users);
app.use('/api/reviews', reviews);
// error middleware
app.use(errorHandler);

app.set('query parser', 'extended');

 


const PORT = process.env.PORT || 5000;

 const server =app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.bold));

// handle unhandled promise rejections

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    //close server and exit process
    server.close(() => process.exit(1))
})