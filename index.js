require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 6060

app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.PORTAL_DB_NAME}:${process.env.PORTAL_DB_PASS}@cluster0.7olulz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    await client.connect();
    const studentsUsers = client.db('students_info').collection('user')

    app.post('/students_signup', async(req,res)=>{
         try {
            const newUser = req.body;
            console.log("Incoming Data:", newUser);

            // check user already exists
            const exists = await studentsUsers.findOne({ email: newUser.email });
        if (exists) {
         return res.status(409).json({ message: "User already exists" });
        }

       const hashPassword = bcrypt.hashSync(newUser.password, 14)

    // insert new user
    await studentsUsers.insertOne({...newUser, password: hashPassword});

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ 
      message: "Something went wrong", 
      error: error.message 
    });
  }
        
        
    })



    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send("Hello world")
})


app.listen(PORT, ()=>{
    console.log(`Server is Running ${PORT}`)
})

