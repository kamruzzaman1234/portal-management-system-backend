require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const PORT = process.env.PORT || 6060

app.use(express.json())
app.use(cors({ origin: 'http://localhost:3000' }));

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
    const studentsUsers = client.db('students_info').collection('user');
    const courseCollection = client.db('students_info').collection('course')

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

    // GET all students
app.get('/students_signup', async (req, res) => {
  try {
    // projection দিয়ে শুধু প্রয়োজনীয় ফিল্ড দেখানো
    const students = await studentsUsers.find({}, {
      projection: {
        full_name: 1,
      student_id: 1,
      email: 1,
      profile_url: 1,
      gender: 1,
      date_of_birth: 1,
      phone: 1,
      address: 1,
      department:1,
      joining_date:1,
      qualification:1,
      type:1,
      date:1,
      nationality:1,
      religion:1,
      father_name:1,
      mother_name:1,
      }
    }).toArray();

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

app.get('/students_signup/:id', async (req, res) => {
  const id = req.params.id;

  // Validate ObjectId
  let query;
  try {
    query = { _id: new ObjectId(id) };
  } catch (error) {
    console.error("Invalid ObjectId format:", error.message);
    return res.status(400).send({ error: "Invalid ID format" });
  }

  const options = {
    projection: {
      full_name: 1,
      student_id: 1,
      email: 1,
      profile_url: 1,
      gender: 1,
      date_of_birth: 1,
      phone: 1,
      address: 1,
      department:1,
      joining_date:1,
      qualification:1,
      type:1,
      date:1,
      nationality:1,
      religion:1,
      father_name:1,
      mother_name:1,
      
    }
  };

  try {
    const student = await studentsUsers.findOne(query, options);

    if (!student) {
      console.log("No document found with the provided ID.");
      return res.status(404).send({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Database query error:", error.message);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Course Fetch 

app.get('/department', async(req,res)=>{
  try{
    const department = await courseCollection.find().toArray()
    res.status(200).json(department)
  }catch(error){
    res.status(500).json({message: 'Failed to fetch department', error})
  }
})


// app.get('/students/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     // MongoDB ObjectId validation
//     const ObjectId = require('mongodb').ObjectId;
//     if (!ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid ID format" });
//     }

//     const student = await studentsUsers.findOne(
//       { _id: new ObjectId(id) },
//       { projection: { student_id: 1 } } // শুধুমাত্র student_id দেখাবে
//     );

//     if (!student) return res.status(404).json({ message: "Student not found" });

//     res.status(200).json(student);
//   } catch (error) {
//     console.error("Error fetching student:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });





    
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

