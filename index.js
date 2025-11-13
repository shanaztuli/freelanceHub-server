const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require('dotenv').config();
const app = express();

const port = process.env.PORT || 5001;

//middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.bd2obtz.mongodb.net/?appName=Cluster01`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
//9n5VeOpA1ETvORef
app.get("/", (req, res) => {
  res.send("Freelance Marketplace server is running ");
});
async function run() {
  try {
    // await client.connect();
    const db = client.db("freelance-db");
    const jobsCollection = db.collection("jobs");
   const acceptedTasksCollection = db.collection('acceptedTask');

//jobs functions
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection
        .find()
        .sort({ postedDate: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/latest-jobs", async (req, res) => {
      const result = await jobsCollection
        .find()
        .sort({ postedDate: -1 })
        .limit(8)
        .toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const { id } = req.params;
      const result = await jobsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
//for getting users own posted jobs 
app.get('/myjobs',async (req,res)=>{
  const email = req.query.email;
  const jobs = await jobsCollection.find({userEmail:email}).toArray();
  res.send(jobs);
});


// to update by their id

app.put('/jobs/:id',async (req,res)=>{
  const {id} = req.params;
  const updateJob = req.body;

  const filter = {_id:new ObjectId(id)};
  const updatedData = {
    $set: {
      title: updateJob.title,
      category: updateJob.category,
      summary: updateJob.summary,
      coverImage: updateJob.coverImage,
    },
  };
  const result = await jobsCollection.updateOne(filter,updatedData);
  res.send(result);
  
})

//delete posted data by user 

app.delete('/jobs/:id',async(req,res)=>{
  const {id} = req.params;
  const userEmail = req.query.email;
  const job = await jobsCollection.findOne({_id:new ObjectId(id)});
  if(!job)
    return res.status(404).json({message:'Job not found'})
  if(job.userEmail !== userEmail)
  return res.status(403).json({message:'Unauthorized action'})

  const result = await jobsCollection.deleteOne({_id: new ObjectId(id)});
  res.json({message: 'Job deleted successfully',result})
});

    app.post("/jobs", async (req, res) => {
      const data = req.body;
      const result = await jobsCollection.insertOne(data);
      res.send(result);
    });
//accepted task functions

app.post('/acceptedTasks',async (req,res)=>{
  const acceptedTask = req.body;
  const result = await acceptedTasksCollection.insertOne(acceptedTask);
  res.send(result);
})

app.get('/acceptedTasks',async (req,res)=>{
  const email = req.query.email;
  const query = {acceptedBy:email};
  const result = await acceptedTasksCollection.find(query).toArray();
  res.send(result);
})

app.delete('/acceptedTasks/:id',async (req,res)=>{
  const id = req.params.id;
  const query = {_id:new ObjectId(id)};
  const result = await acceptedTasksCollection.deleteOne(query);
  res.send(result);
})

    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error(err);
  }
}
run();

app.listen(port, () => {
  console.log(`Freelance market place server is running on port: ${port}`);
});


