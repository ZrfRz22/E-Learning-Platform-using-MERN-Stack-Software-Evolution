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

// MUI Components
import {
    Avatar, Box, Typography, IconButton, Container, Tab, Paper, Grid, Divider
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

// Custom styled buttons
import { BlueButton, GreenButton, PurpleButton } from "../../../components/buttonStyles";

// Reusable components
import TableTemplate from "../../../components/TableTemplate";
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";

// Icons
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';

// Styled-components
import styled from 'styled-components';

// Container for student action buttons
const ButtonContainer = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const ClassDetails = () => {
    // Getting class ID from the URL params
    const params = useParams();
    const classID = params.id;

    // React Router and Redux setup
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Destructure values from Redux store related to class details
    const {
        teachersList,
        subjectsList,
        sclassStudents,
        sclassDetails,
        loading,
        error,
        response,
        getresponse
    } = useSelector((state) => state.sclass);

    // State for managing tabs and popup messages
    const [value, setValue] = useState('1');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // Function to refresh all class-related data
    const refreshData = useCallback(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
        dispatch(getClassStudents(classID));
        dispatch(getClassTeachers(classID));
    }, [dispatch, classID]);

    // Load data on component mount
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Handle tab change
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Handlers for deleting individual and all subjects
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

    // Handlers for deleting teachers and students
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

    // Column definitions for subjects, students, and teachers
    const subjectColumns = [
        { id: 'name', label: 'Subject Name', minWidth: 170 },
        { id: 'code', label: 'Subject Code', minWidth: 100 },
    ];
    const subjectRows = (subjectsList || []).map((subject) => ({
        name: subject.subName,
        code: subject.subCode,
        id: subject._id,
    }));

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

    // Action buttons for each row in the tables
    const SubjectsButtonHaver = ({ row }) => (
        <>
            <IconButton onClick={() => deleteSubjectHandler(row.id)}><DeleteIcon color="error" /></IconButton>
            <BlueButton variant="contained" onClick={() => navigate(`/Admin/class/subject/${classID}/${row.id}`)}>View</BlueButton>
        </>
    );

    const StudentsButtonHaver = ({ row }) => (
        <ButtonContainer>
            <IconButton onClick={() => deleteStudentHandler(row.id)}><PersonRemoveIcon color="error" /></IconButton>
            <BlueButton variant="contained" onClick={() => navigate("/Admin/students/student/" + row.id)}>View</BlueButton>
            <PurpleButton variant="contained" onClick={() => navigate("/Admin/students/student/attendance/" + row.id)}>Attendance</PurpleButton>
            <BlueButton variant="contained" color="secondary" onClick={() => navigate(`/Admin/students/student/marks/${row.id}`)}>Marks</BlueButton>
        </ButtonContainer>
    );

    const TeachersButtonHaver = ({ row }) => (
        <>
            <IconButton onClick={() => deleteTeacherHandler(row.id)}><PersonRemoveIcon color="error" /></IconButton>
            <BlueButton variant="contained" onClick={() => navigate(`/Admin/teachers/teacher/${row.id}`)}>View</BlueButton>
        </>
    );

    // Floating action buttons (SpeedDial) for adding/deleting entries
    const subjectActions = [
        { icon: <PostAddIcon color="primary" />, name: 'Add New Subject', action: () => navigate("/Admin/addsubject/" + classID) },
        { icon: <DeleteIcon color="error" />, name: 'Delete All Subjects', action: deleteAllSubjectsHandler }
    ];
    const studentActions = [
        { icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student', action: () => navigate("/Admin/class/addstudents/" + classID) },
        { icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students', action: deleteAllStudentsHandler }
    ];
    const teacherActions = [
        { icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Teacher', action: () => navigate(`/Admin/teachers/choosesubject/${classID}`) },
        { icon: <PersonRemoveIcon color="error" />, name: 'Remove All Teachers', action: () => teachersList.forEach(teacher => deleteTeacherHandler(teacher._id)) }
    ];

    // Section components to display table data for each tab
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

    // Main return with tab navigation
    return (
        <Container>
            <Typography variant="h4" gutterBottom>Class Details</Typography>
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