const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const validater = require('validator');
mongoose.Promise=global.Promise;
mongoose.connect(process.env.MONGODB_URI);
var schema = mongoose.Schema;
var userschema= new schema({
  email:{
    required: true,
    type: String,
    minlength: 7,
    unique: true,
    validate:{
      validator: function(email){
        validater.isEmail(email);
      }
    }
  },
  password:{
    required: true,
    type: String,
    minlength: 6
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

userschema.methods.toJSON = function() {
  var userObject=this;
  var user=_.pick(userObject, ['_id','email']);
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

var usermodel= mongoose.model('user', userschema);

module.exports={usermodel};
