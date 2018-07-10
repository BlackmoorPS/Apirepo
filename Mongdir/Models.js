const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const validater = require('validator');
const bcrypt = require('bcryptjs');
const moment = require('moment');
mongoose.Promise=global.Promise;
mongoose.connect(process.env.MONGODB_URI);
//schema
var schema = mongoose.Schema;
var userschema= new schema({
  email:{
    required: true,
    type: String,
    minlength: 7,
    unique: true,
    validate:{
      validator: validater.isEmail,
      message: `{VALUE} is not a valid email`
    }
  },
  password:{
    required: true,
    type: String,
    minlength: 6
  },
  createdAt:{
    default:moment(new Date()).format("DD-MMM-YYYY hh:mm a"),
    type: String
  },
  tokens:[{
    access:{
      type: String,
      required: true
    },
    token:{
      type: String,
      required: true
    }
  }]
});
//schema methods (instance methods)
userschema.methods.toJSON = function() {
  var userObject=this;
  var user=_.pick(userObject, ['_id','email','createdAt']);
  return user;
}

userschema.methods.generateAuthToken = function() {
  var user=this;
  var access= 'auth';
  var token=jwt.sign({_id: user._id.toHexString(), access}, 'Some Secret').toString();
  user.tokens.push({access,token});
  return user.save().then(()=>{
    return token;
  });
}
//schema statics(model methods)
userschema.statics.findByToken = function(token) {
  var User=this;
  var decoded;
  try{
    decoded=jwt.verify(token, 'Some Secret');
    } catch(e){
      return Promise.reject();
    }
   return User.findOne({
    '_id': decoded._id,
    'tokens.access': 'auth',
    'tokens.token':token});
};
//logout methods
userschema.methods.logout= function(token) {
  var user = this;
  return user.update({
    $pull: {
      tokens: {token}
    }
  });
}
//mongoose middleware
userschema.pre('save', function(next){
  var user=this;
  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt)=>{
      bcrypt.hash(user.password, salt, (err, hash)=>{
        user.password=hash;
        next();
      });
});
  }
  else {
    next();
  }
});
//mongoose model
var usermodel= mongoose.model('user', userschema);

module.exports={usermodel};
