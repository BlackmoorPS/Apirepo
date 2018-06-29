const mongoose = require('mongoose');
mongoose.Promise=global.Promise;
mongoose.connect(process.env.MONGODB_URI);
var schema = mongoose.Schema;
var userschema= new schema({
  Name: {type: String,trim: true,required: true, minlength: 2},
  username: {type: String, trim:true, minlength: 4},
  Age: {type: Number,required: true},
  Occupation: {type: String}
});
var usermodel= mongoose.model('user', userschema);

module.exports={usermodel};
