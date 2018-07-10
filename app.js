require('./Config/config');
const express = require('express');
const bodyparser = require('body-parser');
const {usermodel} = require('./Mongdir/Models');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const validator = require('validator');

const port = process.env.PORT;

var app=express();

app.use(bodyparser.json());
//sign-up
app.post('/user', (req,res)=>{
  var body= _.pick(req.body, ['email','password']);
  var newenrty= new usermodel(body);
  newenrty.save().then(()=>{
    return newenrty.generateAuthToken();
  }).then((token)=>{
    res.header('x-header', token).send(newenrty);
  }).catch((e)=>{
    res.status(400).send(e);
  });
});
//authenticate middleware
var authenticate= (req,res,next)=>{
  var token=req.header('x-header');
  usermodel.findByToken(token).then((user)=>{
    if(!user){
      return Promise.reject();
    }
    req.user=user;
    req.token=token;
    next();
  }).catch((e)=>{
    res.status(401).send();
  });
}
//private route
app.get('/user/private', authenticate, (req,res)=>{
  res.send(req.user);
});
//private route get
app.get('/user/private', authenticate, (req,res)=>{
  usermodel.find().then((doc)=>{
    res.send(doc);
  }).catch((e)=>{res.status(400).send(e);});
});
//private route logout
app.delete('/user/private', authenticate, (req,res)=>{
  req.user.logout(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
  res.header('x-header', null).send();
});
//port listener
app.listen(port, ()=>{
  console.log(`App Connected via port ${port}`);
})
