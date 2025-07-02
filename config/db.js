const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () =>{
    const conn = await mongoose.connect(process.env.MONGO_URL, {
    })
    
    console.info(`MongoDB successfully connected at ${conn.connection.host}`.yellow.bold);
    console.info(`Server is running on port:  http://localhost:${process.env.PORT}`.cyan.underline.bold);
}

module.exports = connectDB