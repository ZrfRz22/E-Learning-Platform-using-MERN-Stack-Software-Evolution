// Importing necessary modules and components from React, Redux, Router, Material UI, and local files
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// Redux actions for user and class-related operations
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    deleteSubjectsByClass,
    getClassDetails,
    getClassStudents,
    deleteSubject,
    getSubjectList,
    getClassTeachers
} from "../../../redux/sclassRelated/sclassHandle";

// MUI Components for UI layout and design
import {
    Avatar, Box, Typography, IconButton, Container, Tab, Paper, Grid, Divider
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

// Custom styled buttons for consistent styling
import { BlueButton, GreenButton, PurpleButton } from "../../../components/buttonStyles";

// Reusable components for tables and speed dial actions
import TableTemplate from "../../../components/TableTemplate";
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";

// Icons for various actions
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';

// Styled-components for custom styling
import styled from 'styled-components';

const ClassDetails = () => {
    // Getting class ID from URL parameters
    const params = useParams();
    const classID = params.id;

    // Navigation and Redux dispatch hooks
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Extracting state from Redux store
    const {
        teachersList,     // List of teachers in this class
        subjectsList,     // List of subjects taught in this class
        sclassStudents,   // List of students enrolled in this class
        sclassDetails,    // Details about the class (name, section, etc.)
        loading,         // Loading state indicator
        error,           // Error message if any operation fails
        response,       // Response from API calls
        getresponse     // Additional response data
    } = useSelector((state) => state.sclass);

    // State for tab management (defaults to first tab - Subjects)
    const [value, setValue] = useState('1');

    // State for popup feedback messages
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // Callback function to refresh all class-related data
    const refreshData = useCallback(() => {
        // Fetch class details
        dispatch(getClassDetails(classID, "Sclass"));
        // Fetch subjects for this class
        dispatch(getSubjectList(classID, "ClassSubjects"));
        // Fetch students in this class
        dispatch(getClassStudents(classID));
        // Fetch teachers assigned to this class
        dispatch(getClassTeachers(classID));
    }, [dispatch, classID]);

    // Effect to load data when component mounts or classID changes
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Handler for tab changes
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Handler to delete a specific subject
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

    // Handler to delete all subjects in the class
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

    // Handler to delete a teacher from the class
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

    // Handler to delete a student from the class
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

    // Handler to delete all students from the class
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

    // Column and row configurations for the Subjects table
    const subjectColumns = [
        { id: 'name', label: 'Subject Name', minWidth: 170 },
        { id: 'code', label: 'Subject Code', minWidth: 100 },
    ];
    const subjectRows = (subjectsList || []).map((subject) => ({
        name: subject.subName,
        code: subject.subCode,
        id: subject._id,
    }));

    // Column and row configurations for the Students table
    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ];
    const studentRows = (sclassStudents || []).map((student) => ({
        name: (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={`${process.env.REACT_APP_BASE_URL}/uploads/student/${student.profilePic}`} sx={{ mr: 2 }} />
                {student.name}
            </Box>
        ),
        rollNum: student.rollNum,
        id: student._id,
    }));

    // Column and row configurations for the Teachers table
    const teacherColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'email', label: 'Email', minWidth: 200 },
        { id: 'subject', label: 'Subject', minWidth: 150 },
    ];
    const teacherRows = (teachersList || []).map((teacher) => ({
        name: (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={`${process.env.REACT_APP_BASE_URL}/uploads/teacher/${teacher.profilePic}`} sx={{ mr: 2 }} />
                {teacher.name}
            </Box>
        ),
        email: teacher.email,
        subject: teacher.subject?.subName || "Not assigned",
        id: teacher._id,
    }));

    // Component for subject row actions (delete and view)
    const SubjectsButtonHaver = ({ row }) => (
        <>
            <IconButton onClick={() => deleteSubjectHandler(row.id)}><DeleteIcon color="error" /></IconButton>
            <BlueButton variant="contained" onClick={() => navigate(`/Admin/class/subject/${classID}/${row.id}`)}>View</BlueButton>
        </>
    );

    // Component for student row actions (delete, view, attendance, marks)
    const StudentsButtonHaver = ({ row }) => (
        <ButtonContainer>
            <IconButton onClick={() => deleteStudentHandler(row.id)}><PersonRemoveIcon color="error" /></IconButton>
            <BlueButton variant="contained" onClick={() => navigate("/Admin/students/student/" + row.id)}>View</BlueButton>
            <PurpleButton variant="contained" onClick={() => navigate("/Admin/students/student/attendance/" + row.id)}>Attendance</PurpleButton>
            <BlueButton variant="contained" color="secondary" onClick={() => navigate(`/Admin/students/student/marks/${row.id}`)}>Marks</BlueButton>
        </ButtonContainer>
    );

    // Component for teacher row actions (delete and view)
    const TeachersButtonHaver = ({ row }) => (
        <>
            <IconButton onClick={() => deleteTeacherHandler(row.id)}><PersonRemoveIcon color="error" /></IconButton>
            <BlueButton variant="contained" onClick={() => navigate(`/Admin/teachers/teacher/${row.id}`)}>View</BlueButton>
        </>
    );

    // Speed dial actions for subjects (add new, delete all)
    const subjectActions = [
        { icon: <PostAddIcon color="primary" />, name: 'Add New Subject', action: () => navigate("/Admin/addsubject/" + classID) },
        { icon: <DeleteIcon color="error" />, name: 'Delete All Subjects', action: deleteAllSubjectsHandler }
    ];

    // Speed dial actions for students (add new, delete all)
    const studentActions = [
        { icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student', action: () => navigate("/Admin/class/addstudents/" + classID) },
        { icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students', action: deleteAllStudentsHandler }
    ];

    // Speed dial actions for teachers (add new, remove all)
    const teacherActions = [
        { icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Teacher', action: () => navigate(`/Admin/teachers/choosesubject/${classID}`) },
        { icon: <PersonRemoveIcon color="error" />, name: 'Remove All Teachers', action: () => teachersList.forEach(teacher => deleteTeacherHandler(teacher._id)) }
    ];

    // Subjects tab content component
    const ClassSubjectsSection = () => (
        <>
            {response ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <GreenButton variant="contained" onClick={() => navigate("/Admin/addsubject/" + classID)}>
                        Add Subjects
                    </GreenButton>
                </Box>
            ) : (
                <>
                    <Typography variant="h5" gutterBottom>Subjects List:</Typography>
                    <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                    <SpeedDialTemplate actions={subjectActions} />
                </>
            )}
        </>
    );

    // Students tab content component
    const ClassStudentsSection = () => (
        <>
            {getresponse ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <GreenButton variant="contained" onClick={() => navigate("/Admin/class/addstudents/" + classID)}>
                        Add Students
                    </GreenButton>
                </Box>
            ) : (
                <>
                    <Typography variant="h5" gutterBottom>Students List:</Typography>
                    <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                    <SpeedDialTemplate actions={studentActions} />
                </>
            )}
        </>
    );

    // Teachers tab content component
    const ClassTeachersSection = () => (
        <>
            {teachersList?.length > 0 ? (
                <>
                    <Typography variant="h5" gutterBottom>Teachers List:</Typography>
                    <TableTemplate buttonHaver={TeachersButtonHaver} columns={teacherColumns} rows={teacherRows} />
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

    // Main component render with tab interface
    return (
        <Container>
            {/* Class Header */}
            <Typography variant="h4" marginTop="20px" gutterBottom>Class Details</Typography>
            <StyledPaper elevation={3}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                            {sclassDetails?.sclassName}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Grid container spacing={4} alignItems="center">
                            {/* Number of subjects info */}
                            <Grid item>
                                <StatBox>
                                    <Typography variant="h5">{(subjectsList || []).length}</Typography>
                                    <Typography color="textSecondary">Subjects</Typography>
                                </StatBox>
                            </Grid>

                            {/* Number of students info */}
                            <Grid item>
                                <StatBox>
                                    <Typography variant="h5">{(sclassStudents || []).length}</Typography>
                                    <Typography color="textSecondary">Students</Typography>
                                </StatBox>
                            </Grid>

                            {/* Number of teachers info */}
                            <Grid item>
                                <StatBox>
                                    <Typography variant="h5">{(teachersList || []).length}</Typography>
                                    <Typography color="textSecondary">Teachers</Typography>
                                </StatBox>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </StyledPaper>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange}>
                        <Tab label="Subjects" value="1" />
                        <Tab label="Students" value="2" />
                        <Tab label="Teachers" value="3" />
                    </TabList>
                </Box>
                <TabPanel value="1"><ClassSubjectsSection /></TabPanel>
                <TabPanel value="2"><ClassStudentsSection /></TabPanel>
                <TabPanel value="3"><ClassTeachersSection /></TabPanel>
            </TabContext>
            <Popup message={message} showPopup={showPopup} setShowPopup={setShowPopup} />
        </Container>
    );
};

export default ClassDetails;

// Styled component 
const ButtonContainer = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const StyledPaper = styled(Paper)`
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 32px;
`;

const StatBox = styled(Box)`
  text-align: center;
  padding: 0 16px;
`;