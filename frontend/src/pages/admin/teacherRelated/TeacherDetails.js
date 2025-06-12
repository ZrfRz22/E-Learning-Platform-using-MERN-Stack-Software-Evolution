// Import React and necessary hooks
import React, { useEffect } from 'react';
// Redux actions
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
// Routing
import { useParams, useNavigate } from 'react-router-dom';
// Redux utilities
import { useDispatch, useSelector } from 'react-redux';
// MUI components
import {
    Container, Typography, Box, Avatar, Paper, Grid, Divider,
    List, ListItem, ListItemText, Table, TableBody, TableHead, Button
} from '@mui/material';
// Styled table components
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
// Styled-components
import styled from 'styled-components';
// User deletion action
import { deleteUser } from '../../../redux/userRelated/userHandle';

const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();

    // Select relevant state from Redux store
    const { loading, teacherDetails, error } = useSelector((state) => state.teacher);
    const { sclassStudents } = useSelector((state) => state.sclass);

    const teacherID = params.id;

    // Fetch teacher details on mount or when teacherID changes
    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    // Fetch students of the class taught by teacher, if available
    useEffect(() => {
        if (teacherDetails && teacherDetails.teachSclass?._id) {
            dispatch(getClassStudents(teacherDetails.teachSclass._id));
        }
    }, [dispatch, teacherDetails]);

    if (error) {
        console.log(error); // Log error for debugging
    }

    // Navigate to subject selection page for teacher
    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherDetails?._id}`);
    };

    // Delete teacher and go back to previous page
    const deleteHandler = () => {
        dispatch(deleteUser(teacherID, "Teacher")).then(() => {
            navigate(-1);
        });
    };

    // Construct image URL for profile picture
    const imageUrl = teacherDetails?.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/teacher/${teacherDetails.profilePic}`
        : null;

    // Component for rendering detail label and value
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

    return (
        <>
            {loading ? (
                <div>Loading...</div> // Show loading state
            ) : (
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <StyledPaper elevation={4}>
                        <Grid container spacing={4}>
                            {/* Left Column - Profile Picture and Name */}
                            <Grid
                                item xs={12} md={4}
                                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ProfilePictureContainer>
                                    <StyledAvatar src={imageUrl} />
                                </ProfilePictureContainer>
                                <Box sx={{ textAlign: 'center', mt: 2 }}>
                                    <Typography variant="h4" component="h2" fontWeight={600}>
                                        {teacherDetails?.name}
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Teacher
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* Right Column - Teacher Info and Controls */}
                            <Grid item xs={12} md={8}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
                                    {/* Show "Add Subject" button only if class is assigned AND subject is not assigned */}
                                    {teacherDetails?.teachSclass?._id && !teacherDetails?.teachSubject?._id && (
                                        <Button variant="contained" onClick={handleAddSubject}>
                                            Add Subject
                                        </Button>
                                    )}
                                </Box>

                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                    Teacher Details
                                </Typography>

                                {/* List of Teacher Information */}
                                <List disablePadding>
                                    <DetailItem label="Name" value={teacherDetails?.name} />
                                    <DetailItem label="Email" value={teacherDetails?.email} />
                                    <DetailItem label="Class Taught" value={teacherDetails?.teachSclass?.sclassName} />
                                    <DetailItem label="Subject Taught" value={teacherDetails?.teachSubject?.subName} />
                                </List>
                            </Grid>
                        </Grid>
                    </StyledPaper>

                    {/* Delete Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={deleteHandler}
                            sx={{ py: 1.5, px: 4, fontSize: '1rem' }}
                        >
                            Delete This Teacher
                        </Button>
                    </Box>
                </Container>
            )}
        </>
    );
};

export default TeacherDetails;

const StyledPaper = styled(Paper)`
    padding: 40px;
    border-radius: 20px;
`;

const SummaryPaper = styled(Paper)`
    padding: 24px;
    border-radius: 16px;
    height: 100%;
`;

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