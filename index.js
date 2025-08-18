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

      // User Register
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

// 
app.post('/students_signin', async (req, res) => {
  try {
    const { email, password, student_id } = req.body;

    // input validation
    if (!email || !password || !student_id) {
      return res.status(400).json({ message: "Email, password and student_id not match" });
    }

    // check user exists
    const user = await studentsUsers.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check password
    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // check student_id
    if (user.student_id !== student_id) {
      return res.status(401).json({ message: "Invalid student ID" });
    }

    // success message 
    res.status(200).json({
      message: "Login successful",
      user: {
        full_name: user.full_name,
        email: user.email,
        student_id: user.student_id,
        department: user.department,
        type: user.type,
      }
    });

  } catch (error) {
    console.error("Signin Error:", error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

    
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

