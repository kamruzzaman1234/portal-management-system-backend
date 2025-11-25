require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 6060;

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://your-frontend-domain.com"  // Production domain allow করো
  ],
  credentials: true,
}));

// ✅ MongoDB connection
const uri = `mongodb+srv://${process.env.PORTAL_DB_NAME}:${process.env.PORTAL_DB_PASS}@cluster0.7olulz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // Collections
    const studentsUsers = client.db("students_info").collection("user");
    const courseCollection = client.db("students_info").collection("course");
    const teacherUsers = client.db("students_info").collection("teachers");

    // ---------------------------
    // 🔹 User Signup API
    // ---------------------------
    app.get('/students_singup', async(req,res)=>{
        const students = studentsUsers.find()
        const result = await students.toArray();
        res.send(result)
    })


   app.delete('/students_signup/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await studentsUsers.deleteOne(query); // FIXED: added await

        res.send({ success: true, result });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Delete failed" });
    }
});

    // specific id

    app.get('/students/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = studentsUsers.deleteOne(query);
      res.send(result);
    })

    


    app.post("/students_signup", async (req, res) => {
      try {
        const newUser = req.body;
        const exists = await studentsUsers.findOne({ email: newUser.email });
        if (exists) {
          return res.status(409).json({ message: "User already exists" });
        }
        const hashPassword = bcrypt.hashSync(newUser.password, 14);
        await studentsUsers.insertOne({ ...newUser, password: hashPassword });
        res.status(201).json({ message: "User created successfully" });
      } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ message: "Something went wrong", error: error.message });
      }
    });


    // 🔹 Teacher Signup API
    app.post("/teacher", async (req, res) => {
      try {
        const newUser = req.body;
        const exists = await teacherUsers.findOne({ email: newUser.email });
        if (exists) {
          return res.status(409).json({ message: "User already exists" });
        }
        const hashPassword = bcrypt.hashSync(newUser.password, 14);
        await teacherUsers.insertOne({ ...newUser, password: hashPassword });
        res.status(201).json({ message: "User created successfully" });
      } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ message: "Something went wrong", error: error.message });
      }
    });

    // 🔹 Teachers List API
    app.get("/teacher", async (req, res) => {
      try {
        const teachers = await teacherUsers.find().toArray();
        res.status(200).json(teachers);
      } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
      }
    });

    // 🔹 Root Route ✅
    app.get("/", (req, res) => {
      res.send("Hello World Server is running successfully!");
    });

    // Start server after MongoDB connection
    app.listen(PORT, () => {
      console.log(` Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
run().catch(console.dir);
