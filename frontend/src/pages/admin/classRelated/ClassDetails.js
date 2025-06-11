import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { deleteSubjectsByClass, getClassDetails, getClassStudents, deleteSubject, getSubjectList, getClassTeachers } from "../../../redux/sclassRelated/sclassHandle";
import { Avatar, Box, Container, Typography, Tab, IconButton } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { BlueButton, GreenButton, PurpleButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';

const ClassDetails = () => {
    const params = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { teachersList, subjectsList, sclassStudents, sclassDetails, loading, error, response, getresponse } = useSelector((state) => state.sclass);
    const classID = params.id

    const [value, setValue] = useState('1');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const refreshData = useCallback(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
        dispatch(getClassStudents(classID));
        dispatch(getClassTeachers(classID));
    }, [dispatch, classID]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);



    if (error) {
        console.log(error)
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const deleteSubjectHandler = (deleteID) => {
        dispatch(deleteSubject(deleteID, classID))
            .then(() => {
                setMessage("Subject deleted successfully");
                setShowPopup(true);
                refreshData();
            })
            .catch((err) => {
                setMessage("Failed to delete subject");
                setShowPopup(true);
                console.error("Delete failed:", err);
            });
    };

     const deleteAllSubjectsHandler = () => {
        dispatch(deleteSubjectsByClass(classID, "SubjectsClass"))
            .then(() => {
                setMessage("All subjects removed successfully");
                setShowPopup(true);
                refreshData();
            })
            .catch((err) => {
                setMessage("Failed to remove all subjects");
                setShowPopup(true);
                console.error("Delete failed:", err);
            });
    };

    const deleteTeacherHandler = (deleteID) => {
        dispatch(deleteUser(deleteID, "Teacher"))
            .then(() => {
                setMessage("Teacher removed successfully");
                setShowPopup(true);
                refreshData();
            })
            .catch((err) => {
                setMessage("Failed to remove teacher");
                setShowPopup(true);
                console.error("Delete failed:", err);
            });
    };

    const deleteStudentHandler = (deleteID) => {
        dispatch(deleteUser(deleteID, "Student"))
            .then(() => {
                setMessage("Student removed successfully");
                setShowPopup(true);
                refreshData();
            })
            .catch((err) => {
                setMessage("Failed to remove student");
                setShowPopup(true);
                console.error("Delete failed:", err);
            });
    };

    const deleteAllStudentsHandler = () => {
        dispatch(deleteUser(classID, "StudentsClass"))
            .then(() => {
                setMessage("All students removed successfully");
                setShowPopup(true);
                refreshData();
            })
            .catch((err) => {
                setMessage("Failed to remove students");
                setShowPopup(true);
                console.error("Delete failed:", err);
            });
    };

    const subjectColumns = [
        { id: 'name', label: 'Subject Name', minWidth: 170 },
        { id: 'code', label: 'Subject Code', minWidth: 100 },
    ]

    const subjectRows = subjectsList && subjectsList.length > 0 && subjectsList.map((subject) => {
        return {
            name: subject.subName,
            code: subject.subCode,
            id: subject._id,
        };
    })

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <>
                <IconButton onClick={() => deleteSubjectHandler(row.id)}>
                    <DeleteIcon color="error" />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => {
                        navigate(`/Admin/class/subject/${classID}/${row.id}`)
                    }}
                >
                    View
                </BlueButton >
            </>
        );
    };

    const subjectActions = [
        {
            icon: <PostAddIcon color="primary" />, 
            name: 'Add New Subject',
            action: () => navigate("/Admin/addsubject/" + classID)
        },
        {
            icon: <DeleteIcon color="error" />, 
            name: 'Delete All Subjects',
            action: () => deleteAllSubjectsHandler()
        }
    ];

    const ClassSubjectsSection = () => {
        return (
            <>
                {response ?
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <GreenButton
                            variant="contained"
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                        >
                            Add Subjects
                        </GreenButton>
                    </Box>
                    :
                    <>
                        <Typography variant="h5" gutterBottom>
                            Subjects List:
                        </Typography>

                        <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                        <SpeedDialTemplate actions={subjectActions} />
                    </>
                }
            </>
        )
    }
    
    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    const studentRows = sclassStudents.map((student) => {
        // Construct the full URL to the student's profile picture
        const imageUrl = `${process.env.REACT_APP_BASE_URL}/uploads/student/${student.profilePic}`;
        
        return {
            // Combine student's avatar and name using a flex container
            name: (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Display student profile picture using Avatar */}
                    <Avatar 
                        src={imageUrl} 
                        sx={{ mr: 2 }} // Add spacing between the avatar and the name
                    />
                    {student.name}
                </Box>
            ),
            // Other relevant student information
            rollNum: student.rollNum,
            sclassName: student.sclassName.sclassName,
            id: student._id,
        };
    });


    const StudentsButtonHaver = ({ row }) => {
        return (
            <>
                <IconButton onClick={() => deleteStudentHandler(row.id)}>
                    <PersonRemoveIcon color="error" />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                >
                    View
                </BlueButton>
                <PurpleButton
                    variant="contained"
                    onClick={() =>
                        navigate("/Admin/students/student/attendance/" + row.id)
                    }
                >
                    Attendance
                </PurpleButton>
            </>
        );
    };

    const studentActions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, 
            name: 'Add New Student',
            action: () => navigate("/Admin/class/addstudents/" + classID)
        },
        {
            icon: <PersonRemoveIcon color="error" />, 
            name: 'Delete All Students',
            action: () => deleteAllStudentsHandler()
        },
    ];

    const ClassStudentsSection = () => {
        return (
            <>
                {getresponse ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton
                                variant="contained"
                                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                            >
                                Add Students
                            </GreenButton>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Students List:
                        </Typography>

                        <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                        <SpeedDialTemplate actions={studentActions} />
                    </>
                )}
            </>
        )
    }

    const teacherColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'email', label: 'Email', minWidth: 200 },
        { id: 'subject', label: 'Subject', minWidth: 150 },
    ];

    const teacherRows = teachersList.map((teacher) => {
        // Construct the full URL to the teacher's profile picture
        const imageUrl = `${process.env.REACT_APP_BASE_URL}/uploads/teacher/${teacher.profilePic}`;

        return {
            // Combine teacher's avatar and name using a flex container
            name: (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Display teacher profile picture using Avatar */}
                    <Avatar 
                        src={imageUrl} 
                        sx={{ width: 32, height: 32, mr: 2 }} // Set avatar size and spacing
                    />
                    {teacher.name}
                </Box>
            ),
            // Other relevant teacher information
            email: teacher.email,
            subject: teacher.subject?.subName || "Not assigned",
            id: teacher._id,
        };
    });


    const TeachersButtonHaver = ({ row }) => {
        return (
            <>
                <IconButton onClick={() => deleteTeacherHandler(row.id)}>
                    <PersonRemoveIcon color="error" />
                </IconButton>
                                            
                <BlueButton
                    variant="contained"
                    onClick={() => navigate(`/Admin/teachers/teacher/${row.id}`)}
                >
                    View
                </BlueButton>
            </>
        );
    };

    const teacherActions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, 
            name: 'Add New Teacher',
            action: () => navigate(`/Admin/teachers/choosesubject/${classID}`)
        },
        {
            icon: <PersonRemoveIcon color="error" />, 
            name: 'Remove All Teachers',
            action: () => {
                teachersList.forEach(teacher => {
                    deleteTeacherHandler(teacher._id);
                });
            }
        },
    ];

    const ClassTeachersSection = () => {
        return (
            <>
                {loading ? (
                    <div>Loading teachers...</div>
                ) : teachersList?.length > 0 ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Teachers List:
                        </Typography>
                
                        <TableTemplate 
                            buttonHaver={TeachersButtonHaver} 
                            columns={teacherColumns} 
                            rows={teacherRows} 
                        />
                        <SpeedDialTemplate actions={teacherActions} />
                    </>
                ) : (
                     <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={() => navigate(`/Admin/teachers/choosesubject/${classID}`)}>
                                Add Teacher
                            </GreenButton>
                        </Box>
                )}
            </>
        );
    };

    const ClassDetailsSection = () => {
        const numberOfSubjects = subjectsList?.length || 0;
        const numberOfStudents = sclassStudents?.length || 0;

        return (
            <>
                <Typography variant="h4" align="center" gutterBottom>
                    Class Details
                </Typography>
                <Typography variant="h5" gutterBottom>
                    This is Class {sclassDetails && sclassDetails.sclassName}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Number of Subjects: {numberOfSubjects}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Number of Students: {numberOfStudents}
                </Typography>
                {getresponse &&
                    <GreenButton
                        variant="contained"
                        onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                    >
                        Add Students
                    </GreenButton>
                }
                {response &&
                    <GreenButton
                        variant="contained"
                        onClick={() => navigate("/Admin/addsubject/" + classID)}
                    >
                        Add Subjects
                    </GreenButton>
                }
            </>
        );
    }

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Box sx={{ width: '100%', typography: 'body1', }} >
                        <TabContext value={value}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleChange} sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}>
                                    <Tab label="Details" value="1" />
                                    <Tab label="Subjects" value="2" />
                                    <Tab label="Students" value="3" />
                                    <Tab label="Teachers" value="4" />
                                </TabList>
                            </Box>
                            <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
                                <TabPanel value="1">
                                    <ClassDetailsSection />
                                </TabPanel>
                                <TabPanel value="2">
                                    <ClassSubjectsSection />
                                </TabPanel>
                                <TabPanel value="3">
                                    <ClassStudentsSection />
                                </TabPanel>
                                <TabPanel value="4">
                                    <ClassTeachersSection />
                                </TabPanel>
                            </Container>
                        </TabContext>
                    </Box>
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ClassDetails;