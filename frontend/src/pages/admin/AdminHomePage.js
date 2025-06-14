import { Container, Grid, Paper, Box, Typography, Divider, Button, Collapse } from '@mui/material';
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const AdminHomePage = () => {
    const dispatch = useDispatch();

    // Access Redux state for students, classes, teachers, and notices
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { noticesList } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user);

    const adminID = currentUser._id;

    // Manage which notice items are expanded
    const [expanded, setExpanded] = useState({});

    // Fetch all required data on component mount
    useEffect(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllTeachers(adminID));
        dispatch(getAllNotices(adminID, "Notice"));
    }, [adminID, dispatch]);

    const numberOfStudents = studentsList?.length || 0;
    const numberOfClasses = sclassesList?.length || 0;
    const numberOfTeachers = teachersList?.length || 0;

    // Toggle the expanded state of a notice
    const handleToggle = (noticeId) => {
        setExpanded(prev => ({ ...prev, [noticeId]: !prev[noticeId] }));
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Students Counter Card */}
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <img src={Students} alt="Students" />
                        <Title>Total Students</Title>
                        <Data start={0} end={numberOfStudents} duration={2.5} />
                    </StyledPaper>
                </Grid>

                {/* Classes Counter Card */}
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <img src={Classes} alt="Classes" />
                        <Title>Total Classes</Title>
                        <Data start={0} end={numberOfClasses} duration={5} />
                    </StyledPaper>
                </Grid>

                {/* Teachers Counter Card */}
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <img src={Teachers} alt="Teachers" />
                        <Title>Total Teachers</Title>
                        <Data start={0} end={numberOfTeachers} duration={2.5} />
                    </StyledPaper>
                </Grid>

                {/* Notices Section */}
                <Grid item xs={12}>
                    <NoticesPaper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Notices</Typography>

                        {noticesList && noticesList.length > 0 ? (
                            <NoticesContainer>
                                {noticesList.map((notice) => {
                                    const date = new Date(notice.date);
                                    const dateString = date.toString() !== "Invalid Date"
                                        ? date.toISOString().substring(0, 10)
                                        : "Invalid Date";

                                    return (
                                        <NoticeCard key={notice._id} elevation={2}>
                                            {/* Notice header with title and date */}
                                            <CardHeader sx={{ bgcolor: '#FFA07A', color: 'black', p: 2 }}>
                                                <Typography variant="h6">{notice.title}</Typography>
                                                <Typography variant="caption" color="textSecondary">{dateString}</Typography>
                                            </CardHeader>

                                            <Divider />

                                            {/* Expandable notice details */}
                                            <Collapse in={expanded[notice._id] || false} timeout="auto" unmountOnExit>
                                                <CardContent>
                                                    <Typography variant="body1">{notice.details}</Typography>
                                                </CardContent>
                                            </Collapse>

                                            {/* Toggle button */}
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

// Styled component for individual summary cards
const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  border-radius: 12px;
`;

// Title for cards
const Title = styled.p`
  font-size: 1.25rem;
`;

// CountUp display for numbers
const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

// Wrapper for the entire notices section
const NoticesPaper = styled(Paper)`
  padding: 24px;
  border-radius: 12px;
`;

// Layout container for the notice cards
const NoticesContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Individual notice card container
const NoticeCard = styled(Paper)`
  border-radius: 12px;
  overflow: hidden;
`;

// Header area of each notice card
const CardHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
`;

// Content area that reveals the notice details
const CardContent = styled(Box)`
  padding: 24px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

// Action section containing the toggle button
const CardActions = styled(Box)`
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
`;

export default AdminHomePage;