const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');
const path = require('path'); // Imported path module 
const fs = require('fs'); // Import file system modue 

// Password strength checker function 
function isStrongPassword(password) {

  // Minimum 8 chars, at least one uppercase, lowercase, number, special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return strongPasswordRegex.test(password);
}

const adminRegister = async (req, res) => {
  try {
    // Extract relevant fields from the request body
    const { email, collegeName, password, ...rest } = req.body;

    // Simple password strength check
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      });
    }

    // Hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Check if email already exists
    const existingAdminByEmail = await Admin.findOne({ email });
    if (existingAdminByEmail) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Check if college name already exists
    const existingCollege = await Admin.findOne({ collegeName });
    if (existingCollege) {
      return res.status(409).json({ message: 'College name already exists' });
    }

    // Prepare admin data
    const adminData = {
      email,
      collegeName,
      password: hashedPass,
      ...rest
    };

    // If a profile picture was uploaded, add its filename to the admin data
    if (req.file) {
      adminData.profilePic = req.file.filename;
    }

    // Create and save the new admin document
    const admin = new Admin(adminData);
    const result = await admin.save();

    // Do not return the password in the response
    result.password = undefined;

    // Send success response with created admin data
    return res.status(201).json(result);

  } catch (err) {
    // Log the error for debugging
    console.error('Admin registration error:', err);

    // Return generic server error response
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// Method to replace the admin's previous profile picture to a new one
const updateAdminProfilePic = async (req, res) => {
  try {
    // Find the admin by ID from the URL parameters
    const admin = await Admin.findById(req.params.id);

    // If no admin is found with the given ID, return 404
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Save the old profile picture filename for potential deletion
    const oldImageFilename = admin.profilePic;

    // Set the new profile picture filename (from multer)
    admin.profilePic = req.file.filename;

    // Save the updated admin document
    const updatedAdmin = await admin.save();

    // Remove password before sending back the response
    updatedAdmin.password = undefined;

    // Delete old profile picture if it exists and isn't the default avatar
    if (oldImageFilename && oldImageFilename !== 'default-avatar.jpg') {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'admin', oldImageFilename);

      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Failed to delete old profile picture:', err);
        } else {
          console.log('Old profile picture deleted successfully:', oldImageFilename);
        }
      });
    }

    // Send the updated admin object as a response
    return res.status(200).json(updatedAdmin);

  } catch (err) {
    // Log the error and send server error response
    console.error('Update profile picture error:', err);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

 const adminLogIn = async (req, res) => {
     if (req.body.email && req.body.password) {
         let admin = await Admin.findOne({ email: req.body.email });
         if (admin) {
             const validated = await bcrypt.compare(req.body.password, admin.password);
             if (validated) {
                 admin.password = undefined;
                 res.send(admin);
             } else {
                 res.send({ message: "Invalid password" });
             }
         } else {
             res.send({ message: "User not found" });
         }
     } else {
         res.send({ message: "Email and password are required" });
     }
 };

const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            admin.password = undefined;
            res.send(admin);
        }
        else {
            res.send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

module.exports = { adminRegister, adminLogIn, getAdminDetail, updateAdminProfilePic };
