require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE ==========
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://portalsample.netlify.app', 
  credentials: true
}));

// ========== MONGO CONNECTION ==========
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// ========== SCHEMAS ==========
const studentSchema = new mongoose.Schema({
  name: String,
  matricNo: String
});

const courseSchema = new mongoose.Schema({
  id: String,
  name: String,
  students: [studentSchema],
  attendance: [{ name: String, matricNo: String, date: Date }],
  tests: [{ name: String, matricNo: String, score: Number, date: Date }]
});

const Course = mongoose.model('Course', courseSchema);

// ========== ROUTES ==========

// GET all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch(err) {
    res.status(500).json({ message: "Error fetching courses" });
  }
});

// POST attendance
app.post('/api/attendance/:courseId', async (req,res)=>{
  const { courseId } = req.params;
  const { name, matricNo } = req.body;
  try {
    const course = await Course.findOne({ id: courseId });
    if(!course) return res.status(404).json({ message: "Course not found" });

    course.attendance.push({ name, matricNo, date: new Date() });
    await course.save();
    res.json({ message: "Attendance recorded" });
  } catch(err){
    res.status(500).json({ message: "Error recording attendance" });
  }
});

// POST test score
app.post('/api/tests/:courseId', async (req,res)=>{
  const { courseId } = req.params;
  const { name, matricNo, score } = req.body;
  try {
    const course = await Course.findOne({ id: courseId });
    if(!course) return res.status(404).json({ message: "Course not found" });

    course.tests.push({ name, matricNo, score, date: new Date() });
    await course.save();
    res.json({ message: "Test score recorded" });
  } catch(err){
    res.status(500).json({ message: "Error recording test score" });
  }
});

// ========== START SERVER ==========
app.listen(PORT, ()=> console.log(`Backend running on port ${PORT}`));
