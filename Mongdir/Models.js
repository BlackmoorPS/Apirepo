const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
mongoose.Promise=global.Promise;
mongoose.connect(process.env.MONGODB_URI);
var schema = mongoose.Schema;
var userschema= new schema({
  // Name: {type: String,trim: true,required: true, minlength: 2},
  // username: {type: String, trim:true, minlength: 4},
  // Age: {type: Number,required: true},
  // Occupation: {type: String}
  email:{
    required: true,
    type: String,
    minlength: 7
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

var usermodel= mongoose.model('user', userschema);

module.exports={usermodel};
