const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        }));

        const existingSubjectBySubCode = await Subject.findOne({
            'subjects.subCode': subjects[0].subCode,
            college: req.body.adminID,
        });

        if (existingSubjectBySubCode) {
            res.send({ message: 'Sorry this subcode must be unique as it already exists' });
        } else {
            const newSubjects = subjects.map((subject) => ({
                ...subject,
                sclassName: req.body.sclassName,
                college: req.body.adminID,
            }));

            const result = await Subject.insertMany(newSubjects);
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const allSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ college: req.params.id })
            .populate("sclassName", "sclassName")
        if (subjects.length > 0) {
            res.send(subjects)
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const classSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id })
        if (subjects.length > 0) {
            res.send(subjects)
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const freeSubjectList = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id, teacher: { $exists: false } });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSubjectDetail = async (req, res) => {
    try {
        let subject = await Subject.findById(req.params.id)
            .populate("sclassName", "sclassName")
            // Includes profilePic when retrieving teacher info
            .populate("teacher", "name profilePic"); 

        if (subject) {
            res.send(subject);
        } else {
            res.send({ message: "No subject found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteSubject = async (req, res) => {
    try {
        // Delete a single subject by ID
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        // Remove the reference to this subject from any teacher's teachSubject field
        await Teacher.updateOne(
            { teachSubject: deletedSubject._id },
            { $unset: { teachSubject: "" } }
        );

        // Remove any examResult entries in students that refer to the deleted subject
        await Student.updateMany(
            {},
            { $pull: { examResult: { subName: deletedSubject._id } } }
        );

        // Remove any attendance entries in students that refer to the deleted subject
        await Student.updateMany(
            {},
            { $pull: { attendance: { subName: deletedSubject._id } } }
        );

        // Return the deleted subject as a response
        res.send(deletedSubject);
    } catch (error) {
        // Return a server error response if something goes wrong
        res.status(500).json(error);
    }
};

const deleteSubjects = async (req, res) => {
    try {
        // Delete all subjects belonging to the specified college
        const deletionResult = await Subject.deleteMany({ college: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        // If no subjects were found for deletion, return an appropriate message
        if (deletedCount === 0) {
            res.send({ message: "No Subjects found to delete" });
            return;
        }

        // Fetch the subjects that were previously in the college (should return empty but precautionary)
        const deletedSubjects = await Subject.find({ college: req.params.id });

        // Remove subject references from teachers if they matched any of the deleted subjects
        await Teacher.updateMany(
            {
                subject: { $in: deletedSubjects.map(subject => subject._id) },
                subject: { $exists: true }
            },
            { $unset: { subject: "" } }
        );

        // Send the result of the deletion operation
        res.send(deletionResult);
    } catch (error) {
        // Return a server error response if something goes wrong
        res.status(500).json(error);
    }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        // Find all subjects that belong to the specified class
        const subjectsToDelete = await Subject.find({ sclassName: req.params.id });
        const subjectIds = subjectsToDelete.map(subject => subject._id);

        // Delete all subjects associated with that class
        const deleteResult = await Subject.deleteMany({ sclassName: req.params.id });

        // Remove any matching teachSubject references from teachers
        await Teacher.updateMany(
            { teachSubject: { $in: subjectIds } },
            { $unset: { teachSubject: "" } }
        );

        // Remove exam results and attendance records referring to the deleted subjects from all students
        await Student.updateMany(
            {},
            {
                $pull: {
                    examResult: { subName: { $in: subjectIds } },
                    attendance: { subName: { $in: subjectIds } }
                }
            }
        );

        // Send the result of the deletion operation
        res.send(deleteResult);
    } catch (error) {
        // Return a server error response if something goes wrong
        res.status(500).json(error);
    }
};

module.exports = { subjectCreate, freeSubjectList, classSubjects, getSubjectDetail, deleteSubjectsByClass, deleteSubjects, deleteSubject, allSubjects };