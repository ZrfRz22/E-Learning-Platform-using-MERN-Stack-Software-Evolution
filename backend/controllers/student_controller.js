const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const fs = require('fs'); // import file system module
const path = require('path'); // import path module

// Password strength checker function
function isStrongPassword(password) {
  // Password must be at least 8 characters and include uppercase, lowercase, number, and special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return strongPasswordRegex.test(password);
}

const studentRegister = async (req, res) => {
    try {
        // Destructure required fields from the request body
        const { name, rollNum, password, sclassName, adminID } = req.body;

        // Basic password strength check
        if (!isStrongPassword(password)) {
            return res.status(400).send({ message: 'Password is not strong enough.' });
        }

        // Hash the password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Check if a student with the same roll number, class, and college already exists
        const existingStudent = await Student.findOne({ rollNum, college: adminID, sclassName });

        if (existingStudent) {
            return res.status(409).send({ message: 'Roll Number already exists' });
        }

        // Create a new student object with profile picture if provided
        const newStudent = new Student({
            name,
            rollNum,
            password: hashedPass,
            sclassName,
            college: adminID,

            // (For Profile Picture Feature)
            profilePic: req.file ? req.file.filename : undefined
        });

        // Save the new student to the database
        let result = await newStudent.save();

        // Do not send the password back in the response
        result.password = undefined;

        // Send the student data as the response
        res.send(result);
    } catch (err) {
        // Log the error for debugging
        console.error("CRASH IN STUDENT REGISTER:", err);

        // Respond with an internal server error
        res.status(500).json({ message: "An error occurred.", error: err.message });
    }
};

// Allows students to replace their profile pic with a new one
const updateStudentProfilePic = async (req, res) => {
    try {
        // Find the student document by ID
        const student = await Student.findById(req.params.id);

        if (!student) {
            // Respond with 404 if student is not found
            return res.status(404).json({ message: "Student not found" });
        }

        // Store the old profile picture filename before updating
        const oldImageFilename = student.profilePic;

        // Update the profilePic field with the new uploaded filename
        student.profilePic = req.file.filename;

        // Save the updated student document
        const updatedStudent = await student.save();

        // Remove the password field before sending response
        updatedStudent.password = undefined;

        // If the old image is not the default, delete it from the server
        if (oldImageFilename && oldImageFilename !== "default-avatar.jpg") {
            const oldImagePath = path.join(__dirname, '..', 'uploads', 'student', oldImageFilename);

            // Delete the old file asynchronously
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error("Failed to delete old student profile picture:", err);
                } else {
                    console.log("Successfully deleted old student profile picture.");
                }
            });
        }

        // Send the updated student data in the response
        res.status(200).json(updatedStudent);
    } catch (error) {
        // Log any errors that occur
        console.error("ERROR UPDATING STUDENT PROFILE PIC:", error);

        // Respond with an internal server error
        res.status(500).json({ message: "An error occurred.", error: error.message });
    }
};

const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("college", "collegeName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ college: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("college", "collegeName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteStudent = async (req, res) => {
    try {
        // Find the student by ID and delete them from the database
        const student = await Student.findByIdAndDelete(req.params.id);

        // If student is not found, return a 404 error
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Get the filename of the student's profile picture
        const imageFilename = student.profilePic;

        // Delete the profile picture from the filesystem if it exists and is not the default avatar
        if (imageFilename && imageFilename !== "default-avatar.jpg") {
            const imagePath = path.join(__dirname, '..', 'uploads', 'student', imageFilename);

            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete image file: ${imagePath}`, err);
                } else {
                    console.log(`Successfully deleted image file: ${imagePath}`);
                }
            });
        }

        // Send success response
        res.send({ message: "Student deleted successfully." });

    } catch (error) {
        // Handle server error
        console.error("ERROR DELETING STUDENT:", error);
        res.status(500).json({ message: "An error occurred.", error: error.message });
    }
};

const deleteStudents = async (req, res) => {
    try {
        const collegeId = req.params.id;

        // 1. Find all students associated with the given college
        const studentsToDelete = await Student.find({ college: collegeId });

        // If no students found, return a message
        if (studentsToDelete.length === 0) {
            return res.send({ message: "No students found to delete" });
        }

        // 2. Extract all profile picture filenames that are not the default
        const imageFilesToDelete = studentsToDelete
            .map(student => student.profilePic)
            .filter(pic => pic && pic !== "default-avatar.jpg");

        // 3. Delete all students belonging to the college from the database
        const result = await Student.deleteMany({ college: collegeId });

        // 4. Delete all the collected profile pictures from the file system
        imageFilesToDelete.forEach(filename => {
            const imagePath = path.join(__dirname, '..', 'uploads', 'student', filename);
            fs.unlink(imagePath, (err) => {
                if (err) console.error(`Failed to delete image file: ${imagePath}`, err);
                else console.log(`Successfully deleted image file: ${imagePath}`);
            });
        });

        // Send deletion result (acknowledgment of number of records removed)
        res.send(result);

    } catch (error) {
        console.error("ERROR DELETING STUDENTS:", error);
        res.status(500).json({ message: "An error occurred.", error: error.message });
    }
};

const deleteStudentsByClass = async (req, res) => {
    try {
        const sclassId = req.params.id;

        // 1. Find all students belonging to the specified class
        const studentsToDelete = await Student.find({ sclassName: sclassId });

        // If no students found, respond with a message
        if (studentsToDelete.length === 0) {
            return res.send({ message: "No students found to delete" });
        }

        // 2. Extract all profile picture filenames, skipping any that are default avatars
        const imageFilesToDelete = studentsToDelete
            .map(student => student.profilePic)
            .filter(pic => pic && pic !== "default-avatar.jpg");

        // 3. Delete all students from the class in the database
        const result = await Student.deleteMany({ sclassName: sclassId });

        // 4. Delete each student's profile picture from the filesystem
        imageFilesToDelete.forEach(filename => {
            const imagePath = path.join(__dirname, '..', 'uploads', 'student', filename);
            fs.unlink(imagePath, (err) => {
                if (err) console.error(`Failed to delete image file: ${imagePath}`, err);
                else console.log(`Successfully deleted image file: ${imagePath}`);
            });
        });

        // Send deletion result
        res.send(result);

    } catch (error) {
        console.error("ERROR DELETING STUDENTS BY CLASS:", error);
        res.status(500).json({ message: "An error occurred.", error: error.message });
    }
};

const updateStudent = async (req, res) => {
  try {
    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) {
        return res.status(400).send({
          message:
            'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
        });
      }
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    let result = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    result.password = undefined;
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};


const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const subject = await Subject.findById(subName);

        const existingAttendance = student.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString() &&
                a.subName.toString() === subName
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            // Check if the student has already attended the maximum number of sessions
            const attendedSessions = student.attendance.filter(
                (a) => a.subName.toString() === subName
            ).length;

            if (attendedSessions >= subject.sessions) {
                return res.send({ message: 'Maximum attendance limit reached' });
            }

            student.attendance.push({ date, status, subName });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const collegeId = req.params.id

    try {
        const result = await Student.updateMany(
            { college: collegeId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


module.exports = {
  studentRegister,
  updateStudentProfilePic,
  studentLogIn,
  getStudents,
  getStudentDetail,
  deleteStudents,
  deleteStudent,
  updateStudent,
  studentAttendance,
  deleteStudentsByClass,
  updateExamResult,
  clearAllStudentsAttendanceBySubject,
  clearAllStudentsAttendance,
  removeStudentAttendanceBySubject,
  removeStudentAttendance,
};