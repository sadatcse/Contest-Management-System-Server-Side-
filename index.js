const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "contest-management-system-client.vercel.app",
      "",
    ]
  })
);
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



 

    app.get('/contest/get-id/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      try {const result = await ContestCollection.findOne(filter);
        res.send(result);} catch (err) {res.status(500).send({ error: err.message });}
    });
    app.put('/contest/update-inital/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
    
    
      const filter = { "_id": new ObjectId(id) };
      const updateData = { $inc: { "attemptedCount": 1 } };
    
      try {
        const result = await ContestCollection.updateOne(filter, updateData);
    
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: 'Contest not found' });
        }
    
        if (result.modifiedCount === 0) {
          return res.status(200).json({ success: false, message: 'Contest already confirmed' });
        }
    
        res.status(200).json({ success: true, message: 'Contest confirmed successfully' });
      } catch (error) {
        console.error("Error updating contest:", error);
        res.status(500).json({ success: false, message: 'Failed to update contest' });
      }
    });
    

  app.put('/contest/update-comment/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;
    console.log('Received request to update comment with id:', id);
    console.log('Update data:', updateData);
    
   
    const filter = { _id: new ObjectId(id) };
    try {
        const result = await ContestCollection.updateOne(filter, { $set: updateData });
        if (result.modifiedCount === 1) {
            res.status(200).json({ success: true, message: 'Contest confirmed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Contest not found' });
        }
    } catch (error) {
        console.error('Error confirming contest:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

  app.put('/contest/put-id/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) };
    const updatedData = req.body;
    delete updatedData._id;
    try {
      const result = await ContestCollection.updateOne(filter, { $set: updatedData });
      res.json({ success: true, message: 'contest updated successfully' });
    } catch (error) {
      console.error('Error updating contest:', error);
      res.status(500).json({ success: false, message: 'Failed to update contest' });
    }
  
  });

  app.get('/contest/count-by-creator', async (req, res) => {
    try {
        // Aggregate contest counts by creator email and contest name
        const pipeline = [
            {
                $group: {
                    _id: {
                        creator_email: "$creator_email",
                        contest_name: "$contest_name"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.creator_email",
                    contestCounts: {
                        $push: {
                            contest_name: "$_id.contest_name",
                            count: "$count"
                        }
                    },
                    totalContest: { $sum: "$count" }
                }
            }
        ];
        const contestCounts = await ContestCollection.aggregate(pipeline).toArray();

        // Fetch user details for each creator email
        const creatorEmails = contestCounts.map(entry => entry._id);
        const cursor = userCollection.find({ email: { $in: creatorEmails } });
        const users = await cursor.toArray();

        // Attach user details to contest counts
        const result = contestCounts.map(entry => {
            const user = users.find(user => user.email === entry._id);
            return {
                creator_email: entry._id,
                contestCounts: entry.contestCounts,
                totalContest: entry.totalContest,
                user_details: user
            };
        });

        res.json(result);
    } catch (error) {
        console.error("Error counting contests by creator:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

  app.get('/contest/get-all', async (req, res) => {
    try {const cursor = ContestCollection.find();
      const user = await cursor.toArray();
      res.send(user);} 
    catch (error) {
      console.error("Error fetching all contests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/statistics/admin', async (req, res) => {
    try {
        const userCount = await userCollection.countDocuments();
        const contestCount = await ContestCollection.countDocuments();
        const appliedCount = await UsersRollCollection.countDocuments();

        res.status(200).json({ userCount, contestCount, appliedCount });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
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
      const contest = await cursor.toArray();
      res.json(contest);
    } catch (error) {
      console.error("Error fetching contests by status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });



  app.post('/contest/post', async (req, res) => {
    const contest = req.body;
    console.log(contest);
    const result = await ContestCollection.insertOne(contest);
    res.send(result);
  });

  //contest collection put method 
  app.put('/contest/confirm/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateData = { status: 'confirmed' };

    try {
        const result = await ContestCollection.updateOne(filter, { $set: updateData });
        if (result.modifiedCount === 1) {
            res.status(200).json({ success: true, message: 'Contest confirmed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Contest not found' });
        }
    } catch (error) {
        console.error('Error confirming contest:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
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

  app.get('/user/get-email/:email', async (req, res) => {
    const email = req.params.email; // change to email
    try {
      const cursor = userCollection.find({ email: email }); // change to email
      const user = await cursor.toArray();
      res.send(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch('/user/patch/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedUser = { ...req.body };
      delete updatedUser._id;
      console.log('Filter:', filter); 
      console.log('Updated User:', updatedUser);
  
      if (Object.keys(updatedUser).length === 0) {
        return res.status(400).json({ error: 'No fields to update provided' });
      }
      const result = await userCollection.updateOne(filter, { $set: updatedUser });
  
      console.log('Update Result:', result); 
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (result.modifiedCount === 1) {
        return res.json({ message: 'User updated successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to update user' });
      }
    } catch (error) {
      console.error('Server Error:', error); 
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/user/get-id/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    try {const result = await userCollection.findOne(filter);
      res.send(result);} catch (err) {res.status(500).send({ error: err.message });}
  });

  app.post('/user/post', async (req, res) => {
    const newUser = req.body;
    const existingUser = await userCollection.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
  
    try {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
    } catch (error) {
      console.error("Error inserting new user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.patch('/user/patch/:role/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const role = req.params.role;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: role
        }
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.delete('/user/delete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await userCollection.deleteOne(query);
    res.send(result);
  })



//userrole collection methods 
app.get('/userole/get-all', async (req, res) => {
    const cursor = UsersRollCollection.find();
    const user = await cursor.toArray();
    res.send(user);
  });

  app.get('/userole/get-win/:email', async (req, res) => {
    const { email } = req.params;
    const cursor = UsersRollCollection.find();
    const user = await cursor.toArray();
    const filteredContests = user.filter(contest => 
      contest.submitter_email === email && 
      contest.status === "win"
    );
  
    res.send(filteredContests);
});

app.put('/userole/status/:id', async (req, res) => {
  const { id } = req.params;
  const { status  } = req.body;

  try {
      const result = await UsersRollCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
      );

      if (result.modifiedCount > 0) {
          res.status(200).send({ message: 'Course link updated successfully' });
      } else {
          res.status(404).send({ message: 'Course link not found' });
      }
  } catch (error) {
      res.status(500).send({ message: 'Error updating Course link', error });
  }
});

app.put('/userole/take/:id', async (req, res) => {
  const { id } = req.params;
  const { inputlink } = req.body;

  try {
      const result = await UsersRollCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { inputlink } }
      );

      if (result.modifiedCount > 0) {
          res.status(200).send({ message: 'Course link updated successfully' });
      } else {
          res.status(404).send({ message: 'Course link not found' });
      }
  } catch (error) {
      res.status(500).send({ message: 'Error updating Course link', error });
  }
});

app.get('/userole/get-cid/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { contestd: id };
  try {const result = await UsersRollCollection.find(filter).toArray();;
    res.send(result);} catch (err) {res.status(500).send({ error: err.message });}
});

  app.get('/userole/get-email/:email', async (req, res) => {
    const { email } = req.params;
    const cursor = UsersRollCollection.find();
    const user = await cursor.toArray();
    
    // Filter contests based on submitter's email and deadline
    const currentDate = new Date();
    const filteredContests = user.filter(contest => 
      contest.submitter_email === email && 
      new Date(contest.deadline) > currentDate &&
      contest.status === "registration"
    );
  
    res.send(filteredContests);
});


app.get('/userole/stat/:email', async (req, res) => {
  const { email } = req.params;
  const cursor = UsersRollCollection.find();
  const users = await cursor.toArray();

  const currentDate = new Date();
  
  const filteredContests1 = users.filter(contest => 
      contest.submitter_email === email && 
      contest.status === "win"
  );

  const filteredContests2 = users.filter(contest => 
      contest.submitter_email === email && 
      new Date(contest.deadline) > currentDate &&
      contest.status === "registration"
  );

  const win = filteredContests1.length;
  const registration = filteredContests2.length;

  res.send({ win, registration });
});
  app.get('/userole/get-id/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    try {const result = await UsersRollCollection.findOne(filter);
      res.send(result);} catch (err) {res.status(500).send({ error: err.message });}
  });

  app.post('/userole/post', async (req, res) => {
    const contest = req.body;
    console.log(contest);
    const existingData = await UsersRollCollection.findOne({ contestd: contest.contestd, submitter_email: contest.submitter_email });
    if (existingData) {

      return res.status(400).send({ error: 'Data with this contestd already exists' });
    } else {
      const result = await UsersRollCollection.insertOne(contest);
      res.send(result);
    }
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