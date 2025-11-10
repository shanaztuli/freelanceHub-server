const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const port = process.env.PORT || 5001;

//middleware

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://freelancedbUser:9n5VeOpA1ETvORef@cluster0.bd2obtz.mongodb.net/?appName=Cluster0";

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
    await client.connect();
    const db = client.db("freelance-db");
    const jobsCollection = db.collection("jobs");

    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection
        .find()
        .sort({ postedDate: -1 })
        .toArray();
      res.send(result);
    });

    app.get('/latest-jobs',async (req,res)=>{
      const result = await jobsCollection.find().sort({postedDate:-1}).limit(8).toArray();
      res.send(result);
    })

    app.get('/jobs/:id',async (req,res)=>{
      const {id} = req.params
 const result = await jobsCollection.findOne({_id: new ObjectId(id)})
 res.send(result)
    })
    
    app.post('/jobs', async (req,res)=>{
      const data = req.body;
      const result = await jobsCollection.insertOne(data)
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
