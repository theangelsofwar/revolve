// 'use strict';
require('dotenv').config();

//declare dependencies
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');


const socketio = require('socket.io');
const Nexmo = require('nexmo');

const nexmo = new Nexmo({
  apiKey: 'df0eb028',
  apiSecret: 'vgzyF8q3FPMz9Sep',
}, { debug: true });

const from = '17402426262';
const to = '19143648047';
const text = 'Hello from Nexmo';

nexmo.message.sendSms(from, to, text);


const createError = require('http-errors');
const app = express(); //invoke express  

const cors = require('cors');

const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./api/routes/index');
const testAPIRouter = require('./api/routes/testAPI');
const router = require("express").Router();
const Users = require('./api/routes/Users');
const scheduler = require("./scheduler");

// const MongoClient = require('mongodb').MongoClient;
const mongoose= require('mongoose');
const port = process.env.PORT || 3001;

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'public')));

app.use('/users',Users);

const mongoURI = 'mongodb+srv://violet:VIOLET66@cluster0-fpdoy.mongodb.net/test?retryWrites=true&w=majority';
//mongodb+srv://violet:<password>@cluster0-fpdoy.mongodb.net/test?retryWrites=true&w=majority
//  const client = new MongoClient( mongoURI, { useNewUrlParser: true });
//  client.connect( err => {
//    const collection=client.db("test").collection("devices");
//    client.close();
//  });

//const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://violet:VIOLET66@cluster0-fpdoy.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
mongoose.Promise=global.Promise=global.Promise;

mongoose.connect(
  process.env.mongoURI || "mongodb://localhost/revolve", {
    useMongoClient: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    }
    ).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

const db = mongoose.connection;

db.on("error",(err) => {
  console.log("Mongoose Error: ", err);
});

db.once("open", () => {
  console.log("Mongoose conection successful.");
});


scheduler.start();
// err => {
//   const collection = client.db("test").collection("devices");
//   client.close();



app.use('/', indexRouter);
// app.use('/users', users);
app.use('/testAPI', testAPIRouter);


app.get('/', (req, res) => {
  res.render('index');
});

//react-router handles route on client side
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirnmame, "client/build/index.html"));

});

//catching a form submit
app.post('/',(req, res) => {
  res.send(req.body);
  console.log(req.body);
  const { number, text } = req.body;

  nexmo.message.sendSms(
    from, number, text, { type: 'unicode' },
    (err, responseData) => {
      if(err){
        console.log(err);
      } else {
        const { messages } = responseData;
        const { ['message-id']: id, ['to']: number, ['error-text']: error } = messages[0];
        console.dir(responseData);
        const data = {
          id, 
          number, 
          error
        };
        //emit to client
        io.emit('smsStatus', data);
      }
    }
  );
});


app.get('/api/hello',(req,res) => {
  res.send({ express: 'Hello Halfaxa'});
});

app.post('/api/world', (req, res) => {
  console.log('req is', req.body);
  // console.log('res on line 35 of server is',res);
  res.send(
    `POST response is: ${req.body.post}`,
  );
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log('line 33 of app with res.locals:', res.locals);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log('res.status:', res.status);
  res.render('error');
});

const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected socket io');
  io.on('disconnect', () => {
    console.log('Disconnected Socket io');
  })
});

const server = app.listen(port, () => console.log(`🌎  ==> Server Listening on port ${port}`));

module.exports = app;
