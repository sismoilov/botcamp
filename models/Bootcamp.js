const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 charachters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
        type: String,
        match:  [
            /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/,
            'Please use a valid url with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxLength: [20, 'Phone number can not be longer than 20 charachters']
    },
    email: {
        type: String,
        match: [
             /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],  
    },

    location: {
        //GeoJson Point Mongoose
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
          
          },
          coordinates: {
            type: [Number],
            index: '2dsphere'
          }, 

          formattedAddress: String,
          street: String,
          city: String,
          state: String,
          zipcode: String,
          country: String,
   },
    
    careers: {
        type: [String],
        required: true,
        enum: [
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Business",
            "Other"
        ]
    },
     averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating can not be more than 10'],
     },

     averageCost: {
        type: Number
     },
     
     photo: {
        type: String,
        default: 'no-photo.jpg'
     },

     housing: {
        type: Boolean,
        default: false
     },
     jobAssistance: {
        type: Boolean,
        default: false
     },
     jobGyarantee: {
        type: Boolean,
        default: false
     },
     acceptGi: {
        type: Boolean,
        default: false
     },
     createdAt: {
        type: Date,
        default: Date.now
     },
     user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
     }
}, 
{ 
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

BootcampSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});

BootcampSchema.pre('save', async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }

    // do not save adress in DB
    this.address = undefined;

    next();
});
// cascade delete courses when bootcamp is deleted
BootcampSchema.pre('deleteOne', {document: true, query: false} ,async function(next){
    console.log(`Course being removed from bootcamp  ${this._id}`);
    await this.model('Course').deleteMany({bootcamp: this._id});
    next();
})
// reverse populate with vurtuals
BootcampSchema.virtual('course', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);