import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// Redux actions for user and subject data
import { getUserDetails, deleteUser } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';

// UI and layout components
import {
    Container, Typography, Box, Avatar, Paper, Grid, Divider,
    List, ListItem, ListItemText, Table, TableBody, TableHead, Button
} from '@mui/material';

// Utility functions for attendance calculations
import {
    calculateOverallAttendancePercentage,
    calculateSubjectAttendancePercentage,
    groupAttendanceBySubject
} from '../../../components/attendanceCalculator';

// Custom chart components
import CustomPieChart from '../../../components/CustomPieChart';
import CustomBarChart from '../../../components/CustomBarChart';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

// Styled components for layout customization
import styled from 'styled-components';

const ViewStudent = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { userDetails, loading, error } = useSelector((state) => state.user);

    const studentID = params.id;
    const address = "Student";

    // Fetch student details on component mount
    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    // Fetch subject list once student details are available
    useEffect(() => {
        if (userDetails && userDetails.sclassName && userDetails.sclassName._id) {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails]);

    if (error) {
        console.log(error);
    }

    // Delete student handler
    const deleteHandler = () => {
        dispatch(deleteUser(studentID, address)).then(() => {
            navigate(-1); // Navigate back
        });
    };

    // Extract attendance and marks data from user details
    const subjectAttendance = userDetails?.attendance || [];
    const subjectMarks = userDetails?.examResult || [];

    // Calculate overall and subject-level attendance stats
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: 100 - overallAttendancePercentage }
    ];
    const subjectData = groupAttendanceBySubject(subjectAttendance);

    // Component for reusable detail item in student info
    const DetailItem = ({ label, value }) => (
        <>
            <ListItem>
                <ListItemText
                    primary={label}
                    secondary={value || 'Not specified'}
                    primaryTypographyProps={{ fontWeight: 'bold', color: 'text.primary' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem', color: 'text.secondary' }}
                />
            </ListItem>
            <Divider component="li" />
        </>
    );

    // Show loading message while data is being fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* --- Student Profile Section --- */}
            <StyledPaper elevation={4}>
                <Grid container spacing={4}>
                    {/* Left side: profile picture and name */}
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <ProfilePictureContainer>
                            <StyledAvatar src={`${process.env.REACT_APP_BASE_URL}/uploads/student/${userDetails?.profilePic}`} />
                        </ProfilePictureContainer>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="h4" component="h2" fontWeight={600}>
                                {userDetails?.name}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Student
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Right side: personal and academic details */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
                            <Button variant="contained" onClick={() => navigate(`/Admin/students/student/attendance/${studentID}`)}>
                                Add Attendance
                            </Button>
                            <Button variant="contained" onClick={() => navigate(`/Admin/students/student/marks/${studentID}`)}>
                                Add Marks
                            </Button>
                        </Box>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Student Details
                        </Typography>
                        <List disablePadding>
                            <DetailItem label="Name" value={userDetails?.name} />
                            <DetailItem label="Roll Number" value={userDetails?.rollNum} />
                            <DetailItem label="Class" value={userDetails?.sclassName?.sclassName} />
                            <DetailItem label="College" value={userDetails?.college?.collegeName} />
                        </List>
                    </Grid>
                </Grid>
            </StyledPaper>

            {/* --- Attendance and Exam Summary Section --- */}
            <Grid container spacing={4} sx={{ mt: 2 }}>
                {/* Attendance Summary Card */}
                <Grid item xs={12} md={6}>
                    <SummaryPaper elevation={3}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Attendance Summary
                        </Typography>
                        {subjectAttendance && subjectAttendance.length > 0 ? (
                            <>
                                {/* Pie Chart for overall attendance */}
                                <Box sx={{ height: '500px', display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <CustomPieChart data={chartData} />
                                </Box>
                                {/* Attendance Table */}
                                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                    <Table>
                                        <TableHead>
                                            <StyledTableRow>
                                                <StyledTableCell>Subject</StyledTableCell>
                                                <StyledTableCell>Present</StyledTableCell>
                                                <StyledTableCell>Total</StyledTableCell>
                                                <StyledTableCell>%</StyledTableCell>
                                            </StyledTableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Object.entries(subjectData).map(([subName, { present, sessions }], index) => (
                                                <StyledTableRow key={index}>
                                                    <StyledTableCell>{subName}</StyledTableCell>
                                                    <StyledTableCell>{present}</StyledTableCell>
                                                    <StyledTableCell>{sessions}</StyledTableCell>
                                                    <StyledTableCell>
                                                        {calculateSubjectAttendancePercentage(present, sessions)}%
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </>
                        ) : (
                            <Typography>No attendance records found.</Typography>
                        )}
                    </SummaryPaper>
                </Grid>

                {/* Exam Results Card */}
                <Grid item xs={12} md={6}>
                    <SummaryPaper elevation={3}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Exam Results
                        </Typography>
                        {subjectMarks && subjectMarks.length > 0 ? (
                            <>
                                {/* Bar Chart for exam results */}
                                <Box sx={{ height: '500px', mb: 2 }}>
                                    <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                                </Box>
                                {/* Exam Results Table */}
                                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                    <Table>
                                        <TableHead>
                                            <StyledTableRow>
                                                <StyledTableCell>Subject</StyledTableCell>
                                                <StyledTableCell>Marks</StyledTableCell>
                                            </StyledTableRow>
                                        </TableHead>
                                        <TableBody>
                                            {subjectMarks.map((result, index) => (
                                                <StyledTableRow key={index}>
                                                    <StyledTableCell>{result.subName?.subName}</StyledTableCell>
                                                    <StyledTableCell>
                                                        {result.marksObtained}
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() => navigate(
                                                                `/Admin/students/student/marks/${studentID}`,
                                                                {
                                                                    state: { subjectId: result.subName?._id }
                                                                }
                                                            )}
                                                            sx={{ ml: '50%' }}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </>
                        ) : (
                            <Typography>No exam results found.</Typography>
                        )}
                    </SummaryPaper>
                </Grid>
            </Grid>

            {/* Delete Student Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button variant="contained" color="error" onClick={deleteHandler} sx={{ py: 1.5, px: 4, fontSize: '1rem' }}>
                    Delete This Student
                </Button>
            </Box>
        </Container>
    );
};

export default ViewStudent;

// Container for profile and summary sections
const StyledPaper = styled(Paper)`
    padding: 40px;
    border-radius: 20px;
`;

// Container for each summary card
const SummaryPaper = styled(Paper)`
    padding: 24px;
    border-radius: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

// Profile picture container
const ProfilePictureContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  min-width: 200px;
  min-height: 200px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

// Styled avatar
const StyledAvatar = styled(Avatar)`
  && {
    width: 200px !important;
    height: 200px !important;
    font-size: 6rem;
    border: 4px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    object-fit: cover;
  }
`;
