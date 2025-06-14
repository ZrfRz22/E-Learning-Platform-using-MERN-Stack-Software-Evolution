import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Collapse, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Redux action imports
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';

import CountUp from 'react-countup';
import styled from 'styled-components';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

// Image assets
import Students from "../../assets/img1.png";
import Lessons from "../../assets/subjects.svg";
import Tests from "../../assets/assignment.svg";
import Time from "../../assets/time.svg";

const TeacherHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Accessing Redux state
    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);
    const { noticesList } = useSelector((state) => state.notice);

    // Extracting class and subject IDs
    const classID = currentUser.teachSclass?._id;
    const subjectID = currentUser.teachSubject?._id;

    // To manage toggle state of notice details
    const [expanded, setExpanded] = useState({});

    // Fetch data on component mount or when dependencies change
    useEffect(() => {
        if (subjectID) {
            dispatch(getSubjectDetails(subjectID, "Subject"));
        }
        if (classID) {
            dispatch(getClassStudents(classID));
        }
        if (currentUser.school?._id) {
            dispatch(getAllNotices(currentUser.school._id, "Notice"));
        }
    }, [dispatch, subjectID, classID, currentUser.school?._id]);

    // Fallback values if data hasn't loaded
    const numberOfStudents = sclassStudents?.length || 0;
    const numberOfSessions = subjectDetails?.sessions || 0;

    // Toggle notice description
    const handleToggle = (noticeId) => {
        setExpanded(prev => ({ ...prev, [noticeId]: !prev[noticeId] }));
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Counter Card - Class Students */}
                <Grid item xs={12} md={3} lg={3}>
                    <StyledPaper>
                        <img src={Students} alt="Students" />
                        <Title>Class Students</Title>
                        <Data start={0} end={numberOfStudents} duration={2.5} />
                    </StyledPaper>
                </Grid>

                {/* Counter Card - Lessons */}
                <Grid item xs={12} md={3} lg={3}>
                    <StyledPaper>
                        <img src={Lessons} alt="Lessons" />
                        <Title>Total Lessons</Title>
                        <Data start={0} end={numberOfSessions} duration={5} />
                    </StyledPaper>
                </Grid>

                {/* Counter Card - Tests */}
                <Grid item xs={12} md={3} lg={3}>
                    <StyledPaper>
                        <img src={Tests} alt="Tests" />
                        <Title>Tests Taken</Title>
                        <Data start={0} end={24} duration={4} />
                    </StyledPaper>
                </Grid>

                {/* Counter Card - Total Hours */}
                <Grid item xs={12} md={3} lg={3}>
                    <StyledPaper>
                        <img src={Time} alt="Time" />
                        <Title>Total Hours</Title>
                        <Data start={0} end={30} duration={4} suffix=" hrs" />
                    </StyledPaper>
                </Grid>

                {/* Notices Section */}
                <Grid item xs={12}>
                    <NoticesPaper elevation={3}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Notices</Typography>

                        {/* Check if there are any notices */}
                        {noticesList && noticesList.length > 0 ? (
                            <NoticesContainer>
                                {noticesList.map((notice) => {
                                    const date = new Date(notice.date);
                                    const dateString = date.toString() !== "Invalid Date"
                                        ? date.toISOString().substring(0, 10)
                                        : "Invalid Date";

                                    return (
                                        <NoticeCard key={notice._id} elevation={2}>
                                            {/* Notice title and date */}
                                            <CardHeader sx={{ bgcolor: '#FFA07A', color: 'black', p: 2 }}>
                                                <Typography variant="h6">{notice.title}</Typography>
                                                <Typography variant="caption" color="textSecondary">{dateString}</Typography>
                                            </CardHeader>
                                            <Divider />

                                            {/* Expandable content */}
                                            <Collapse in={expanded[notice._id] || false} timeout="auto" unmountOnExit>
                                                <CardContent>
                                                    <Typography variant="body1">{notice.details}</Typography>
                                                </CardContent>
                                            </Collapse>

                                            {/* Toggle Button */}
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

// --- Styled Components for layout and appearance ---

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

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

const NoticesPaper = styled(Paper)`
    padding: 24px;
    border-radius: 12px;
`;

const NoticesContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const NoticeCard = styled(Paper)`
    border-radius: 12px;
    overflow: hidden;
`;

const CardHeader = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
`;

const CardContent = styled(Box)`
    padding: 24px;
    white-space: pre-wrap;
    word-wrap: break-word;
`;

const CardActions = styled(Box)`
    display: flex;
    justify-content: flex-end;
    padding: 8px 16px;
    border-top: 1px solid #f0f0f0;
`;

export default TeacherHomePage;