const router = require('express').Router();

// const { adminRegister, adminLogIn, deleteAdmin, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');

const { adminRegister, adminLogIn, getAdminDetail, updateAdminProfilePic} = require('../controllers/admin-controller.js');

const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, getSclassTeachers } = require('../controllers/class-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    updateStudentProfilePic,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance } = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance, updateTeacherProfilePic } = require('../controllers/teacher-controller.js');

const multer = require('multer');
const path = require('path');

// Multer Storage Configurations
// Storage for Admin profile pictures
const adminStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/admin'), // Save in 'uploads/admin' folder
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)), // Unique filename using timestamp
});

// Storage for Student profile pictures
const studentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/student'), // Save in 'uploads/student' folder
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)), // Unique filename using timestamp
});

// Storage for Teacher profile pictures
const teacherStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/teacher'), // Save in 'uploads/teacher' folder
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)), // Unique filename using timestamp
});

// Multer Upload Handlers
const uploadAdmin = multer({ storage: adminStorage });     // For admin uploads
const uploadStudent = multer({ storage: studentStorage }); // For student uploads
const uploadTeacher = multer({ storage: teacherStorage }); // For teacher uploads

// Admin Routes

// Register a new admin with profile picture upload
router.post('/AdminReg', uploadAdmin.single('profilePic'), adminRegister);
router.post('/AdminLogin', adminLogIn);

// Update an admin's profile picture by ID
router.put("/AdminProfilePic/:id", uploadAdmin.single('profilePic'), updateAdminProfilePic);

router.get("/Admin/:id", getAdminDetail);

// router.delete("/Admin/:id", deleteAdmin)

// router.put("/Admin/:id", updateAdmin)


// Student Routes
// Register a new student with profile picture upload
router.post('/StudentReg', uploadStudent.single('profilePic'), studentRegister);
router.post('/StudentLogin', studentLogIn)

// Update an student's profile picture by ID
router.put("/StudentProfilePic/:id", uploadStudent.single('profilePic'), updateStudentProfilePic);

router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)

router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)

router.put("/Student/:id", updateStudent)

router.put('/UpdateExamResult/:id', updateExamResult)

router.put('/StudentAttendance/:id', studentAttendance)

router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)


// Teacher Routes
// Register a new teacher with profile picture upload
router.post('/TeacherReg', uploadTeacher.single('profilePic'), teacherRegister);
router.post('/TeacherLogin', teacherLogIn)

// Update an teacher's profile picture by ID
router.put("/TeacherProfilePic/:id", uploadTeacher.single('profilePic'), updateTeacherProfilePic);

router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)

router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)

router.put("/TeacherSubject", updateTeacherSubject)

router.post('/TeacherAttendance/:id', teacherAttendance)


// Notice Routes
router.post('/NoticeCreate', noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)

router.put("/Notice/:id", updateNotice)


// Complain Routes
router.post('/ComplainCreate', complainCreate);

router.get('/ComplainList/:id', complainList);


// Sclass Routes
router.post('/SclassCreate', sclassCreate);

router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)

router.get("/Sclass/Students/:id", getSclassStudents)
router.get('/Sclass/Teachers/:id', getSclassTeachers);

router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)


// Subject Routes
router.post('/SubjectCreate', subjectCreate);

router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

module.exports = router;