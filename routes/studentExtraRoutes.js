const express = require('express');
const router = express.Router();
const StudentExtra = require('../StudentExtra');
const multer = require('multer');
const path = require('path');

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to handle updating student extra details
router.put('/student-extra/:rollNo', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  const { rollNo } = req.params;
  const { githubLink, codeChef, hacker, leetCode } = req.body;

  // Generate accessible file paths
  const profilePicture = req.files['profilePicture'] 
    ? `uploads/${req.files['profilePicture'][0].filename}` 
    : null;
  
  const certificate = req.files['certificate'] 
    ? `uploads/${req.files['certificate'][0].filename}` 
    : null;

  try {
    // Fetch existing data (if any)
    const existingData = await StudentExtra.findOne({ rollNo });

    // Update student extra details
    const updatedData = await StudentExtra.findOneAndUpdate(
      { rollNo },
      { 
        githubLink: githubLink || existingData?.githubLink,
        codeChef: codeChef || existingData?.codeChef,
        hacker: hacker || existingData?.hacker,
        leetCode: leetCode || existingData?.leetCode,
        profilePicture: profilePicture || existingData?.profilePicture,
        certificate: certificate || existingData?.certificate,
      },
      { new: true, upsert: true }
    );

    res.status(200).send(updatedData);
  } catch (error) {
    console.error('Error updating student extra details:', error.message);
    res.status(500).send('Failed to update student extra details');
  }
});

// Route to fetch student extra details
router.get('/student-extra/:rollNo', async (req, res) => {
  const { rollNo } = req.params;

  try {
    const studentExtra = await StudentExtra.findOne({ rollNo });
    if (!studentExtra) {
      return res.status(404).send('No extra details found for this student');
    }
    res.status(200).send(studentExtra);
  } catch (error) {
    console.error('Error fetching student extra details:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
