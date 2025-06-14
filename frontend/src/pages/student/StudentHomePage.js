// Importing necessary libraries and components
import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Collapse, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import CountUp from 'react-countup';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

// Assets
import Subject from "../../assets/subjects.svg";
import Assignment from "../../assets/assignment.svg";

// Main component
const StudentHomePage = () => {
    const dispatch = useDispatch();

    // Getting user and subject data from Redux store
    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const { noticesList } = useSelector((state) => state.notice);

    // Local state for attendance and notice expansion
    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [expanded, setExpanded] = useState({});

    // Class ID for current student
    const classID = currentUser.sclassName._id;

    // Fetch user details and subjects when component mounts
    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
    }, [dispatch, currentUser._id, classID]);

    // Update attendance from user details
    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    // Toggle expansion state of notice
    const handleToggle = (noticeId) => {
        setExpanded(prev => ({ ...prev, [noticeId]: !prev[noticeId] }));
    };

    // Attendance calculations
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    // Data for pie chart
    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const numberOfSubjects = subjectsList && subjectsList.length;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>

                {/* --- Stat Card: Total Subjects --- */}
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <img src={Subject} alt="Subjects" />
                        <Title>Total Subjects</Title>
                        <Data start={0} end={numberOfSubjects} duration={2.5} />
                    </StyledPaper>
                </Grid>

                {/* --- Stat Card: Total Assignments (Hardcoded for now) --- */}
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <img src={Assignment} alt="Assignments" />
                        <Title>Total Assignments</Title>
                        <Data start={0} end={5} duration={2} />
                    </StyledPaper>
                </Grid>

                {/* --- Stat Card: Attendance Pie Chart --- */}
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <Title>Overall Attendance</Title>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
                            {subjectAttendance && subjectAttendance.length > 0 ? (
                                <CustomPieChart data={chartData} />
                            ) : (
                                <Typography variant="body2" color="textSecondary">No Attendance Data</Typography>
                            )}
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* --- Notices Section --- */}
                <Grid item xs={12}>
                    <NoticesPaper elevation={3}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Notices</Typography>
                        {noticesList && noticesList.length > 0 ? (
                            <NoticesContainer>
                                {noticesList.map((notice) => {
                                    // Format notice date
                                    const date = new Date(notice.date);
                                    const dateString = date.toString() !== "Invalid Date"
                                        ? date.toISOString().substring(0, 10)
                                        : "Invalid Date";

                                    return (
                                        <NoticeCard key={notice._id} elevation={2}>
                                            {/* --- Notice Header --- */}
                                            <CardHeader sx={{ bgcolor: '#FFA07A', color: 'black', p: 2 }}>
                                                <Typography variant="h6">{notice.title}</Typography>
                                                <Typography variant="caption" color="textSecondary">{dateString}</Typography>
                                            </CardHeader>

                                            <Divider />

                                            {/* --- Notice Content (Expandable) --- */}
                                            <Collapse in={expanded[notice._id] || false} timeout="auto" unmountOnExit>
                                                <CardContent>
                                                    <Typography variant="body1">{notice.details}</Typography>
                                                </CardContent>
                                            </Collapse>

                                            {/* --- Toggle Button --- */}
                                            <CardActions>
                                                <Button
                                                    onClick={() => handleToggle(notice._id)}
                                                    endIcon={expanded[notice._id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                >
                                                    {expanded[notice._id] ? 'Show Less' : 'Show More'}
                                                </Button>
                                            </CardActions>
                                        </NoticeCard>
                                    );
                                })}
                            </NoticesContainer>
                        ) : (
                            <Typography variant="subtitle1">No notices to display.</Typography>
                        )}
                    </NoticesPaper>
                </Grid>
            </Grid>
        </Container>
    );
};

// --- Styled Components ---

// Generic card used for stats (subjects, assignments, attendance)
const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 240px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  border-radius: 12px;
`;

// Title inside stat cards
const Title = styled.p`
  font-size: 1.25rem;
`;

// CountUp number for animations
const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

// Container for the notices section
const NoticesPaper = styled(Paper)`
    padding: 24px;
    border-radius: 12px;
`;

// Flex container for all notice cards
const NoticesContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

// Individual notice card
const NoticeCard = styled(Paper)`
    border-radius: 12px;
    overflow: hidden;
`;

// Header of the notice card
const CardHeader = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
`;

// Body/content of the notice
const CardContent = styled(Box)`
    padding: 24px;
    white-space: pre-wrap;
    word-wrap: break-word;
`;

// Button section for expand/collapse
const CardActions = styled(Box)`
    display: flex;
    justify-content: flex-end;
    padding: 8px 16px;
    border-top: 1px solid #f0f0f0;
`;

export default StudentHomePage;