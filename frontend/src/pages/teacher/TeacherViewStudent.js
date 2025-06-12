import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// Redux action to get student details
import { getUserDetails } from '../../redux/userRelated/userHandle';

// Material-UI components
import {
    Container, Typography, Box, Avatar, Paper, Grid, Divider,
    List, ListItem, ListItemText, Button
} from '@mui/material';

// Utility function to calculate attendance %
import { calculateSubjectAttendancePercentage } from '../../components/attendanceCalculator';
// Custom styled table components
import { StyledTableCell, StyledTableRow } from '../../components/styles';
// Styled-components for custom styling
import styled from 'styled-components';

const TeacherViewStudent = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();

    // Redux state
    const { currentUser, userDetails, loading, error } = useSelector((state) => state.user);

    // Extract student ID from URL params
    const studentID = params.id;

    // Extract subject details taught by current teacher
    const teachSubject = currentUser.teachSubject?.subName;
    const teachSubjectID = currentUser.teachSubject?._id;

    // Fetch student details when component mounts
    useEffect(() => {
        dispatch(getUserDetails(studentID, "Student"));
    }, [dispatch, studentID]);

    // Handle errors if any
    if (error) {
        console.log(error);
    }

    // Filter attendance and marks specific to this teacher's subject
    const attendanceBySubject = userDetails?.attendance?.filter(att => att.subName?._id === teachSubjectID) || [];
    const marksBySubject = userDetails?.examResult?.filter(res => res.subName?._id === teachSubjectID) || [];

    // Attendance statistics
    const presentCount = attendanceBySubject.filter(att => att.status === 'Present').length;
    const totalSessions = attendanceBySubject.length;
    const subjectAttendancePercentage = calculateSubjectAttendancePercentage(presentCount, totalSessions);

    // Helper component to display student detail items
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

    // Show loading state while data is being fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    // Construct profile picture URL if available
    const imageUrl = userDetails?.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/student/${userDetails.profilePic}`
        : null;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Main Profile Section */}
            <StyledPaper elevation={4}>
                <Grid container spacing={4}>
                    {/* Left Column: Profile Picture & Name */}
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <ProfilePictureContainer>
                            <StyledAvatar src={imageUrl} />
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

                    {/* Right Column: Student Info & Action Buttons */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
                            <Button variant="contained" onClick={() => navigate(`/Teacher/class/student/attendance/${studentID}/${teachSubjectID}`)}>
                                Add Attendance
                            </Button>
                            <Button variant="contained" onClick={() => navigate(`/Teacher/class/student/marks/${studentID}/${teachSubjectID}`)}>
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

            {/* Attendance & Marks Summary Section */}
            <Grid container spacing={4} sx={{ mt: 2 }}>
                {/* Attendance Summary */}
                <Grid item xs={12} md={6}>
                    <SummaryPaper elevation={3}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Attendance in "{teachSubject}"
                        </Typography>
                        {attendanceBySubject.length > 0 ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h2" component="p" color="primary">
                                    {subjectAttendancePercentage}%
                                </Typography>
                                <Typography variant="subtitle1" color="textSecondary">
                                    {presentCount} / {totalSessions} sessions attended
                                </Typography>
                            </Box>
                        ) : (
                            <Typography>No attendance records found for this subject.</Typography>
                        )}
                    </SummaryPaper>
                </Grid>

                {/* Exam Results Summary */}
                <Grid item xs={12} md={6}>
                    <SummaryPaper elevation={3}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Marks in "{teachSubject}"
                        </Typography>
                        {marksBySubject.length > 0 ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h2" component="p" color="secondary">
                                    {marksBySubject[0].marksObtained}
                                </Typography>
                                <Typography variant="subtitle1" color="textSecondary">
                                    Marks Obtained
                                </Typography>
                                <Button
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate(`/Teacher/class/student/marks/${studentID}/${teachSubjectID}`)}
                                >
                                    Edit Marks
                                </Button>
                            </Box>
                        ) : (
                            <Typography>No exam results found for this subject.</Typography>
                        )}
                    </SummaryPaper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TeacherViewStudent;


// --- Styled Components for Custom UI ---

// Main paper wrapping the student profile
const StyledPaper = styled(Paper)`
    padding: 40px;
    border-radius: 20px;
`;

// Summary containers for attendance and marks
const SummaryPaper = styled(Paper)`
    padding: 24px;
    border-radius: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

// Container for round profile image
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

// Styled Avatar image
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