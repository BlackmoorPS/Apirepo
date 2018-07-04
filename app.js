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

app.get('/user', (req,res)=>{
  usermodel.find().then((doc)=>{
    res.send(doc);
  }).catch((e)=>{res.status(400).send(e);});
});

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

app.get('/user/private', authenticate, (req,res)=>{
  res.send(req.user);
});

app.delete('/user/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  usermodel.findByIdAndRemove(id).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }
    res.send(doc);
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/user/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  var body= _.pick(req.body, ['email','password']);
  usermodel.findByIdAndUpdate(id, {$set:body}).then((doc) => {
    res.send(doc);
  }).catch((e) => {
    res.status(400).send();
  });
});

app.get('/user/:id', (req, res) => {
  var id=req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  usermodel.findById(id).then((doc)=>{
    if(!doc){
      return res.status(400).send();
    }
    res.send({doc});
  }).catch((e)=>{res.status(404).send(e);});
});

app.listen(port, ()=>{
  console.log(`App Connected via port ${port}`);
})
