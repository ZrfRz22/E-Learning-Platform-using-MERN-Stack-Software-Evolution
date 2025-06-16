const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const fs = require('fs'); // import file system module
const path = require('path'); // import path module

// Password strength checker function
function isStrongPassword(password) {
  // At least 8 chars, with uppercase, lowercase, digit, special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return strongPasswordRegex.test(password);
}

const teacherRegister = async (req, res) => {
    try {
        // Extract teacher details from request body
        const { name, email, password, role, college, teachSubject, teachSclass } = req.body;

        // Validate password strength
        if (!isStrongPassword(password)) {
            return res.status(400).send({ message: 'Password is not strong enough.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Check if a teacher with the same email already exists
        const existingTeacherByEmail = await Teacher.findOne({ email });
        if (existingTeacherByEmail) {
            return res.send({ message: 'Email already exists' });
        }

        // Create a new teacher instance
        const newTeacher = new Teacher({
            name,
            email,
            password: hashedPass,
            role,
            college,
            teachSubject,
            teachSclass,

            // Save the uploaded profile picture filename (if provided), else leave undefined
            profilePic: req.file ? req.file.filename : undefined
        });

        // Save the new teacher to the database
        let result = await newTeacher.save();

        // Optionally assign this teacher to a subject (if one was provided)
        if (teachSubject) {
            await Subject.findByIdAndUpdate(teachSubject, { teacher: result._id });
        }

        // Exclude password from the response
        result.password = undefined;
        res.send(result);

    } catch (err) {
        console.error("CRASH IN TEACHER REGISTER:", err);
        res.status(500).json({ message: "An error occurred.", error: err.message });
    }
};


const updateTeacherProfilePic = async (req, res) => {
    try {
        // Find the teacher by ID
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Store the current profile picture filename (before updating)
        const oldImageFilename = teacher.profilePic;

        // Update the profile picture with the new uploaded file
        teacher.profilePic = req.file.filename;

        // Save the updated teacher record
        const updatedTeacher = await teacher.save();
        updatedTeacher.password = undefined; // hide password from response

        // If the old profile picture exists and is not the default avatar, delete it from storage
        if (oldImageFilename && oldImageFilename !== "default-avatar.jpg") {
            const oldImagePath = path.join(__dirname, '..', 'uploads', 'teacher', oldImageFilename);
            
            // Attempt to delete the old image file
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error("Failed to delete old teacher profile picture:", err);
                } else {
                    console.log("Successfully deleted old teacher profile picture.");
                }
            });
        }

        // Send back the updated teacher data
        res.status(200).json(updatedTeacher);

    } catch (error) {
        console.error("ERROR UPDATING TEACHER PROFILE PIC:", error);
        res.status(500).json({ message: "An error occurred.", error: error.message });
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("college", "collegeName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ college: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("college", "collegeName")
            .populate("teachSclass", "sclassName")
        if (teacher) {
            teacher.password = undefined;
            res.send(teacher);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        // Find and delete the teacher by ID
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        if (!deletedTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Unassign the teacher from their subject (if any)
        await Subject.updateOne(
            { teacher: deletedTeacher._id },
            { $unset: { teacher: "" } }
        );

        // === Delete teacher's profile picture from storage ===
        const imageFilename = deletedTeacher.profilePic;
        if (imageFilename && imageFilename !== "default-avatar.jpg") {
            const imagePath = path.join(__dirname, '..', 'uploads', 'teacher', imageFilename);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete image file: ${imagePath}`, err);
                } else {
                    console.log(`Successfully deleted image file: ${imagePath}`);
                }
            });
        }

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};


const deleteTeachers = async (req, res) => {
    try {
        const collegeId = req.params.id;

        // === Step 1: Get all teachers for the given college to retrieve image filenames ===
        const teachersToDelete = await Teacher.find({ college: collegeId });

        if (teachersToDelete.length === 0) {
            return res.send({ message: "No teachers found to delete" });
        }

        // Filter out only valid profile pics (excluding default avatar)
        const imageFilesToDelete = teachersToDelete
            .map(teacher => teacher.profilePic)
            .filter(pic => pic && pic !== "default-avatar.jpg");

        // === Step 2: Delete teachers from DB ===
        const deletionResult = await Teacher.deleteMany({ college: collegeId });

        // === Step 3: Delete profile picture files ===
        imageFilesToDelete.forEach(filename => {
            const imagePath = path.join(__dirname, '..', 'uploads', 'teacher', filename);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete image: ${filename}`, err);
                } else {
                    console.log(`Deleted image: ${filename}`);
                }
            });
        });

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};


// Delete all teachers assigned to a specific class
const deleteTeachersByClass = async (req, res) => {
    try {
        const sclassId = req.params.id;

        // === Step 1: Get all teachers for the given class ===
        const teachersToDelete = await Teacher.find({ teachSclass: sclassId });

        if (teachersToDelete.length === 0) {
            return res.send({ message: "No teachers found to delete" });
        }

        // Filter profile pics to delete (excluding default)
        const imageFilesToDelete = teachersToDelete
            .map(t => t.profilePic)
            .filter(p => p && p !== "default-avatar.jpg");

        // === Step 2: Delete teachers from DB ===
        const deletionResult = await Teacher.deleteMany({ teachSclass: sclassId });

        // === Step 3: Delete associated profile pictures ===
        imageFilesToDelete.forEach(filename => {
            const imagePath = path.join(__dirname, '..', 'uploads', 'teacher', filename);
            fs.unlink(imagePath, err => {
                if (err) {
                    console.error("File deletion error:", err);
                } else {
                    console.log(`Deleted teacher profile picture: ${filename}`);
                }
            });
        });

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
};

// Controller function to retrieve all teachers assigned to a specific class (sclass)
const getTeachersByClass = async (req, res) => {
    try {
        // Query the database for teachers whose 'teachSclass' matches the requested class ID
        // Also populate the related subject and class name fields
        const teachers = await Teacher.find({ teachSclass: req.params.id })
            .populate("teachSubject", "subName")       // Populate only the 'subName' from the teachSubject reference
            .populate("teachSclass", "sclassName");    // Populate only the 'sclassName' from the teachSclass reference

        // If no teachers are found, respond with a 404 status and message
        if (!teachers || teachers.length === 0) {
            return res.status(404).json({ message: "No teachers found for this class" });
        }

        // Convert each teacher document to a plain JS object and remove sensitive information
        const modifiedTeachers = teachers.map((teacher) => {
            const t = teacher.toObject();  // Convert Mongoose document to plain object
            delete t.password;             // Remove password field for security
            return t;                      // Return the sanitized object
        });

        // Send the sanitized list of teachers with a 200 OK status
        res.status(200).json(modifiedTeachers);
    } catch (err) {
        // Log the error and return a 500 Internal Server Error response
        console.error("Error in getTeachersByClass:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
  teacherRegister,
  updateTeacherProfilePic,
  teacherLogIn,
  getTeachers,
  getTeacherDetail,
  updateTeacherSubject,
  deleteTeacher,
  deleteTeachers,
  deleteTeachersByClass,
  teacherAttendance,
  getTeachersByClass,
  // updateTeacher // Uncomment if you implement updateTeacher
};