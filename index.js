const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
    

  const userCollection = client.db('Contest').collection('User');
  const ContestCollection = client.db('Contest').collection('Contest');
  const UsersRollCollection = client.db('Contest').collection('CUser');
  const PaymentCollection = client.db('Contest').collection('Payment');


  //contest collection methods 

  app.get('/contest/get-all', async (req, res) => {
    const cursor = ContestCollection.find();
    const user = await cursor.toArray();
    res.send(user);
  });

  app.get('/contest/get-id/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    try {const result = await ContestCollection.findOne(filter);
      res.send(result);} catch (err) {res.status(500).send({ error: err.message });}
  });

  //user collection methods 
  app.get('/user/get-all', async (req, res) => {
    const cursor = userCollection.find();
    const user = await cursor.toArray();
    res.send(user);
  });

  app.get('/user/get-id/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    try {const result = await userCollection.findOne(filter);
      res.send(result);} catch (err) {res.status(500).send({ error: err.message });}
  });

//userrole collection methods 
app.get('/userole/get-all', async (req, res) => {
    const cursor = UsersRollCollection.find();
    const user = await cursor.toArray();
    res.send(user);
  });
  app.get('/userole/get-id/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    try {const result = await UsersRollCollection.findOne(filter);
      res.send(result);} catch (err) {res.status(500).send({ error: err.message });}
  });
//payment  collection methods 
app.get('/payment/get-all', async (req, res) => {
    const cursor = PaymentCollection.find();
    const user = await cursor.toArray();
    res.send(user);
  });  

  app.get('/payment/get-id/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    try {const result = await PaymentCollection.findOne(filter);
      res.send(result);} catch (err) {res.status(500).send({ error: err.message });}
  });

// Send a ping to confirm a successful connection
 await client.db("admin").command({ ping: 1 });
 console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Welcome to our server')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})