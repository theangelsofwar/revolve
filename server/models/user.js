// 'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Reminder = require('./reminder');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;
// const assert=require('assert');
// //once logged in to db through mongoose, log a success message
// db.once("open", () => {
//   console.log("Mongoose connection successful.");
// });
// //Set up default mongoose connection
// var mongoDB = 'mongodb://127.0.0.1/my_database';
// mongoose.connect(mongoDB, { useNewUrlParser: true });
//  //Get the default connection
// var db = mongoose.connection;
// //Bind connection to error event (to get notification of connection errors)
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.on('error', console.error.bind(console, 'MongoDB connection error:')); = require('mongoose')

const userSchema = new Schema({
  firstName: {
    type: String, 
    required: true
  },
  lastName: {
    type: String, 
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: (email) => {
      //return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
    },
    unique: true
  },
  password: {
    type: String,
    min: 6,
    max: 16,
    required: true
  },
  adminAccess: {
    type: Boolean,
    default: false,
  },
  systemAccess: {
    type: Boolean,
    default: false,
  },
  mobileNumber: {
    type: String,
    // validate: {
    //   validator: v => return /\d{3}-\d{4/.test(v);
    //   },
    //   message: '{VALUE} is not valid phone number!'
    // },
    required: true
  },
  reminders: [
    {
      //we store Object Ids in array, which will refer to the ids in Reminder 
      type: Schema.Types.ObjectId,
      ref: 'Reminder',
      autopopulate: true
    }
  ]
});
userSchema.plugin(require('mongoose-autopopulate'));

//to store hash passwords from middleware input on signup form
//we cannot use arrow syntax because we need to keep the context of this.
userSchema.pre('save', function(next) {
  bcrypt.hash(this.password, SALT_WORK_FACTOR, (err, hash) => {
    console.log('this is the hash in user mongoose schema: '+ hash);

    if(err) return next(err);
    //reassign document to hashed version. 
    this.password=hash;
    //next call to save
    return next();
  })
});
//adding a post reminders hooks to find, takes callback next
//dbUser is the document instance that matches a particular id, to cascade to document of reminders
userSchema.post('find', async function(docs) {
    await docs[0].populate('reminders').execPopulate().then(() => {
      console.log(docs[0]);
    })
});


const User = mongoose.model('User', userSchema); //EXTRACT SCHEMA MONGOOSE MODEL



//create Schema
// const UserSchema = new Schema({
//   first_name: {
//     type: String
//   }, 
//   last_name: {
//     type: String
//   },
//   email: {
//     type: String, 
//     required: true
//   }, 
//   password: {
//     type: String,
//     required: true
//   }, 
//   date: {
//     type: Date,
//     default: Date.now
//   }
//   })

  // module.exports = User = mongoose.model('users', UserSchema)
  module.exports = User;