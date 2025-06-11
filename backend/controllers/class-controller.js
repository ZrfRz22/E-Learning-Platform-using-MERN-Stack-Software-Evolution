const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

const sclassCreate = async (req, res) => {
    try {
        const sclass = new Sclass({
            sclassName: req.body.sclassName,
            college: req.body.adminID
        });

        const existingSclassByName = await Sclass.findOne({
            sclassName: req.body.sclassName,
            college: req.body.adminID
        });

        if (existingSclassByName) {
            res.send({ message: 'Sorry this class name already exists' });
        }
        else {
            const result = await sclass.save();
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const sclassList = async (req, res) => {
    try {
        let sclasses = await Sclass.find({ college: req.params.id })
        if (sclasses.length > 0) {
            res.send(sclasses)
        } else {
            res.send({ message: "No sclasses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSclassDetail = async (req, res) => {
    try {
        let sclass = await Sclass.findById(req.params.id);
        if (sclass) {
            sclass = await sclass.populate("college", "collegeName")
            res.send(sclass);
        }
        else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getSclassStudents = async (req, res) => {
    try {
        let students = await Student.find({ sclassName: req.params.id })
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
}

const getSclassTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ teachSclass: req.params.id })
            .populate('teachSubject', 'subName subCode')
            .populate('teachSclass', 'sclassName'); 

        if (teachers.length > 0) {
            const sanitizedTeachers = teachers.map(teacher => ({
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,

                // To retrieve the profile picture of all teachers to be displayed
                profilePic: teacher.profilePic, 
                subject: teacher.teachSubject?.subName || 'Not assigned',
                subjectCode: teacher.teachSubject?.subCode || '',
                sclass: teacher.teachSclass?.sclassName || '',
            }));

            res.json(sanitizedTeachers);
        } else {
            res.json([]);
        }
    } catch (err) {
        console.error("Error fetching teachers:", err);
        res.status(500).json({ error: err.message });
    }
};

const deleteSclass = async (req, res) => {
    try {
        const deletedClass = await Sclass.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.send({ message: "Class not found" });
        }
        const deletedStudents = await Student.deleteMany({ sclassName: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ teachSclass: req.params.id });
        res.send(deletedClass);
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteSclasses = async (req, res) => {
    try {
        const deletedClasses = await Sclass.deleteMany({ college: req.params.id });
        if (deletedClasses.deletedCount === 0) {
            return res.send({ message: "No classes found to delete" });
        }
        const deletedStudents = await Student.deleteMany({ college: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ college: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ college: req.params.id });
        res.send(deletedClasses);
    } catch (error) {
        res.status(500).json(error);
    }
}


module.exports = { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, getSclassTeachers };