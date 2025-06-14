import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import {
    Container, Typography, Box, Avatar, Paper, Grid, Divider
} from '@mui/material';
import { BlueButton, GreenButton, PurpleButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import styled from 'styled-components';

const ViewSubject = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();

    // Destructuring state from Redux
    const { subloading, subjectDetails, sclassStudents, getresponse, error } = useSelector((state) => state.sclass);

    // Getting subject and class IDs from the URL params
    const { classID, subjectID } = params;

    // On component mount, fetch subject and student details
    useEffect(() => {
        dispatch(getSubjectDetails(subjectID, "Subject"));
        dispatch(getClassStudents(classID));
    }, [dispatch, subjectID, classID]);

    // Log any error to the console
    if (error) {
        console.log(error);
    }

    // Define columns for student table
    const studentColumns = [
        { id: 'rollNum', label: 'Roll No.', minWidth: 100 },
        { id: 'name', label: 'Name', minWidth: 220 },
    ];

    // Map student data into table row format
    const studentRows = (sclassStudents || []).map((student) => ({
        rollNum: student.rollNum,
        name: (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={`${process.env.REACT_APP_BASE_URL}/uploads/student/${student.profilePic}`} sx={{ mr: 2 }} />
                {student.name}
            </Box>
        ),
        id: student._id,
    }));

    // Action buttons for each student row in the table
    const StudentActionButtons = ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <BlueButton
              variant="contained"
              onClick={() => navigate("/Admin/students/student/" + row.id)}
            >
              View
            </BlueButton>
            <PurpleButton
                variant="contained"
                onClick={() => navigate(`/Admin/subject/student/attendance/${row.id}/${subjectID}`)}
            >
                Attendance
            </PurpleButton>
            <BlueButton
                variant="contained"
                onClick={() => navigate(`/Admin/subject/student/marks/${row.id}/${subjectID}`)}
            >
                Marks
            </BlueButton>
        </Box>
    );

    return (
        <>
            {/* Show loading message while subject data is being fetched */}
            {subloading ? (
                <div>Loading...</div>
            ) : (
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    {/* SUBJECT HEADER SECTION */}
                    <StyledPaper elevation={3}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                                    {subjectDetails?.subName}
                                </Typography>
                                <Typography color="textSecondary">
                                    Subject Code: {subjectDetails?.subCode}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Grid container spacing={4} alignItems="center">
                                    {/* Total sessions info */}
                                    <Grid item>
                                        <StatBox>
                                            <Typography variant="h5">{subjectDetails?.sessions}</Typography>
                                            <Typography color="textSecondary">Total Sessions</Typography>
                                        </StatBox>
                                    </Grid>

                                    {/* Number of students info */}
                                    <Grid item>
                                        <StatBox>
                                            <Typography variant="h5">{(sclassStudents || []).length}</Typography>
                                            <Typography color="textSecondary">Students</Typography>
                                        </StatBox>
                                    </Grid>

                                    {/* Display teacher avatar and name or Add Teacher button */}
                                    <Grid item>
                                        <StatBox>
                                            {subjectDetails?.teacher ? (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                    <Avatar
                                                        sx={{ width: 56, height: 56 }}
                                                        src={`${process.env.REACT_APP_BASE_URL}/uploads/teacher/${subjectDetails.teacher.profilePic}`}
                                                    />
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {subjectDetails.teacher.name}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <GreenButton
                                                    variant="contained"
                                                    onClick={() => navigate("/Admin/teachers/addteacher/" + subjectDetails._id)}
                                                >
                                                    Add Teacher
                                                </GreenButton>
                                            )}
                                        </StatBox>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </StyledPaper>

                    {/* STUDENT LIST SECTION */}
                    <SectionPaper elevation={3}>
                        <SectionHeader>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Enrolled Students</Typography>
                            <GreenButton
                                variant="contained"
                                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                            >
                                Add Students
                            </GreenButton>
                        </SectionHeader>
                        <Divider />

                        {/* Show message if no students found */}
                        {getresponse ? (
                            <Box sx={{ p: 2 }}>No students found</Box>
                        ) : (
                            // Student data table with action buttons
                            <TableTemplate buttonHaver={StudentActionButtons} columns={studentColumns} rows={studentRows} />
                        )}
                    </SectionPaper>
                </Container>
            )}
        </>
    );
};

export default ViewSubject;

// --- STYLED COMPONENTS ---

// Styled wrapper for the header section
const StyledPaper = styled(Paper)`
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 32px;
`;

// Styled wrapper for each section like student list
const SectionPaper = styled(Paper)`
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 24px;
`;

// Flex container for section headers with buttons
const SectionHeader = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

// Box component for displaying statistics (sessions, students, etc.)
const StatBox = styled(Box)`
    padding: 16px;
    text-align: center;
    min-width: 120px;
`;