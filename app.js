require('./Config/config');
const express = require('express');
const bodyparser = require('body-parser');
const {usermodel} = require('./Mongdir/mongCnModel');
const {ObjectID} = require('mongodb');

const port = process.env.PORT;

var app=express();

app.use(bodyparser.json());

app.post('/user', (req,res)=>{
  var newenrty= new usermodel({
    Name: req.body.Name,
    Age: req.body.Age,
  });
  newenrty.save().then((docs)=>{
    res.send(docs);
  }).catch((e)=>{
    res.status(400).send(e);
  });
});

app.get('/user', (req,res)=>{
  usermodel.find().then((doc)=>{
    res.send(doc);
  }).catch((e)=>{res.status(400).send(e);});
});

// app.delete('/user/:id', (req,res) => {
//   var id=req.params.id;
//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send();
//   }
//   usermodel.findByIdAndRemove(id).then((doc)=>{
//     if(!doc){
//       return res.status(400).send();
//     }
//     res.send(doc);
//   }).catch(e)=>{res.send(e);}
// });
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
