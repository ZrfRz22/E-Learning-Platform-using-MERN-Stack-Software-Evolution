const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');


// Password strength checker function
function isStrongPassword(password) {
  // Minimum 8 chars, at least one uppercase, lowercase, number, special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return strongPasswordRegex.test(password);
}

const adminRegister = async (req, res) => {
  try {
    const { password } = req.body;

    if (!isStrongPassword(password)) {
      return res.status(400).send({
        message:
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const admin = new Admin({
      ...req.body,
      password: hashedPass,
    });

    const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
    const existingCollege = await Admin.findOne({ collegeName: req.body.collegeName });

    if (existingAdminByEmail) {
      return res.send({ message: 'Email already exists' });
    } else if (existingCollege) {
      return res.send({ message: 'College name already exists' });
    } else {
      let result = await admin.save();
      result.password = undefined;
      return res.send(result);
    }
  } catch (err) {
    res.status(500).json(err);
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

// const deleteAdmin = async (req, res) => {
//     try {
//         const result = await Admin.findByIdAndDelete(req.params.id)

//         await Sclass.deleteMany({ college: req.params.id });
//         await Student.deleteMany({ college: req.params.id });
//         await Teacher.deleteMany({ college: req.params.id });
//         await Subject.deleteMany({ college: req.params.id });
//         await Notice.deleteMany({ college: req.params.id });
//         await Complain.deleteMany({ college: req.params.id });

//         res.send(result)
//     } catch (error) {
//         res.status(500).json(err);
//     }
// }

// const updateAdmin = async (req, res) => {
//     try {
//         if (req.body.password) {
//             const salt = await bcrypt.genSalt(10)
//             res.body.password = await bcrypt.hash(res.body.password, salt)
//         }
//         let result = await Admin.findByIdAndUpdate(req.params.id,
//             { $set: req.body },
//             { new: true })

//         result.password = undefined;
//         res.send(result)
//     } catch (error) {
//         res.status(500).json(err);
//     }
// }

// module.exports = { adminRegister, adminLogIn, getAdminDetail, deleteAdmin, updateAdmin };

module.exports = { adminRegister, adminLogIn, getAdminDetail };
