const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const port = 4000
const MongoClient = require('mongodb').MongoClient;
const password = '164211';
require('dotenv').config()
console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wwwk6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

var admin = require("firebase-admin");



var serviceAccount = require("./configs/burj-al-aarab-firebase-adminsdk-nxnag-70f6602da0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB
});


const app = express()
app.use(bodyParser.json())
app.use(cors())


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db(process.env.DB_NAME).collection("bookings");

  app.post('/addBooking', (req, res) =>{

      const newBooking = req.body;
      collection.insertOne(newBooking)
      .then(result =>{
          res.send(result.insertedCount > 0)
      })
  })

  app.get('/bookings', (req, res) =>{
       const bearer = req.headers.authorization;

       if(bearer && bearer.startsWith('Bearer ')){
         const idToken = bearer.split(' ')[1];
         console.log({idToken});
         admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail, queryEmail)
          if(tokenEmail === req.query.email){
            collection.find({email:req.query.email})
            .toArray((err, documents) =>{
                res.send(documents)
            })
          }
          
        }).catch(function(error) {
          // Handle error
       });
       }
       else{
         res.send('unauthorized access')
       }

  })
  
});


app.get('/', (req, res) => {
  res.send('Hello sharif!')
})

app.listen(process.env.PORT || port)