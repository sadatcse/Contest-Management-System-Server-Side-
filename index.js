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
    try {const cursor = ContestCollection.find();
      const user = await cursor.toArray();
      res.send(user);} 
    catch (error) {
      console.error("Error fetching all contests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get('/contest/get-id/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    try {
      const result = await ContestCollection.findOne(filter);
      res.send(result);
    } catch (error) {
      console.error("Error fetching contest by ID:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get('/contest/get-email/:name', async (req, res) => {
    const request = req.params.name;
    try {
      const cursor = ContestCollection.find({ creator_email: request });
      const user = await cursor.toArray();
      res.send(user);
    } catch (error) {
      console.error("Error fetching contest by creator email:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.get('/contest/get-search/:search', async (req, res) => {
    const searchQuery = req.params.search;
    try {
      const cursor = ContestCollection.find({ contest_name: { $regex: searchQuery, $options: 'i' } });
      const contests = await cursor.toArray();
      res.json(contests);
    } catch (error) {
      console.error("Error searching contests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/contest/get-status/:status', async (req, res) => {
    const status = req.params.status;
    try {
      const cursor = ContestCollection.find({ status: status });
      const contests = await cursor.toArray();
      res.json(contests);
    } catch (error) {
      console.error("Error fetching contests by status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //contest collection post method 

  app.post('/contest/post', async (req, res) => {
    const contest = req.body;
    console.log(contest);
    const result = await ContestCollection.insertOne(contest);
    res.send(result);
  });

  //contest collection put method 

  
  app.put('/contest/put-id/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedData = req.body;
    delete updatedData._id;
    try {
      const result = await ContestCollection.updateOne(filter, { $set: updatedData });
      res.json({ success: true, message: 'contest updated successfully' });
    } catch (error) {
      console.error('Error updating Assignment:', error);
      res.status(500).json({ success: false, message: 'Failed to update contest' });
    }
  
  });

  //contest collection delete method 
  
  app.delete('/contest/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const filter = { _id: new ObjectId(id) };
        const result = await ContestCollection.deleteOne(filter);
        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'contest deleted successfully' });
        } else {
            res.status(404).json({ message: 'contest not found' });
        }
    } catch (error) {
        console.error('Error deleting contest:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
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

  app.post('/user/post', async (req, res) => {
    const newuser = req.body;
    console.log(newuser);
    const result = await userCollection.insertOne(newuser);
    res.send(result);
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