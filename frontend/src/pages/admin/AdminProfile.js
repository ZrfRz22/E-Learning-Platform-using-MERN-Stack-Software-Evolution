import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
    Container,
    Typography,
    Box,
    Avatar,
    Paper,
    Grid,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    CircularProgress
} from '@mui/material';
import { Edit } from '@mui/icons-material';

// Import Redux actions for updating profile picture and fetching data
import { updateUserProfilePic } from '../../redux/userRelated/userHandle';
import { getAllSclasses, getSubjectList } from '../../redux/sclassRelated/sclassHandle';

const AdminProfile = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    // Get current user from Redux state
    const { currentUser } = useSelector((state) => state.user);

    // Get class and subject list from Redux state
    const { sclassesList, subjectsList, loading: sclassLoading } = useSelector((state) => state.sclass);

    // Fetch all classes assigned to the current admin
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
        }
    }, [dispatch, currentUser]);

    // Once class list is fetched, get subjects for each class
    useEffect(() => {
        const fetchSubjectsForClasses = async () => {
            const fetches = sclassesList.map((classItem) =>
                dispatch(getSubjectList(classItem._id, "ClassSubjects"))
            );
            await Promise.all(fetches);
        };

        if (sclassesList.length > 0) {
            fetchSubjectsForClasses();
        }
    }, [dispatch, sclassesList]);

    // Construct profile picture URL if available
    const imageUrl = currentUser.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/admin/${currentUser.profilePic}`
        : null;

    // Trigger file input when edit overlay is clicked
    const handleEditButtonClick = () => {
        fileInputRef.current.click();
    };

    // Handle file upload and dispatch action to update profile picture
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePic', file);
            dispatch(updateUserProfilePic(currentUser.role, currentUser._id, formData));
        }
    };

    // Component to display a labeled detail item
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
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <StyledPaper elevation={4}>
                <Grid container spacing={4}>
                    {/* Profile picture and user information section */}
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <ProfilePictureContainer onClick={handleEditButtonClick}>
                            <StyledAvatar src={imageUrl}>
                                {!imageUrl && currentUser.name?.charAt(0)}
                            </StyledAvatar>
                            <EditOverlay>
                                <Edit sx={{ color: 'white' }} />
                                <Typography variant="caption" color="white">Change</Typography>
                            </EditOverlay>
                        </ProfilePictureContainer>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="h4" component="h2" fontWeight={600}>
                                {currentUser.name}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Administrator
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Admin details and managed classes/subjects section */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            Admin Details
                        </Typography>
                        <List disablePadding>
                            <DetailItem label="Name" value={currentUser.name} />
                            <DetailItem label="Email" value={currentUser.email} />
                            <DetailItem label="College" value={currentUser.collegeName} />
                        </List>

                        {/* Display list of managed classes and subjects */}
                        <Box mt={4}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                Managed Classes & Subjects
                            </Typography>
                            {sclassLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {sclassesList && sclassesList.length > 0 ? (
                                        sclassesList.map((classItem, index) => {
                                            // Filter subjects that belong to this class
                                            const subjectsForThisClass = subjectsList.filter(
                                                (subject) => subject.sclassName === classItem._id
                                            );
                                            return (
                                                <React.Fragment key={index}>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={classItem.sclassName}
                                                            primaryTypographyProps={{ fontWeight: 'bold' }}
                                                            secondary={
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pt: 1 }}>
                                                                    {subjectsForThisClass.length > 0 ? (
                                                                        subjectsForThisClass.map((subject, i) => (
                                                                            <Chip key={i} label={subject.subName} size="small" />
                                                                        ))
                                                                    ) : (
                                                                        <Typography variant="body2" color="textSecondary">
                                                                            No subjects assigned.
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                    {index < sclassesList.length - 1 && <Divider component="li" />}
                                                </React.Fragment>
                                            )
                                        })
                                    ) : (
                                        <ListItem>
                                            <ListItemText primary="No classes found." />
                                        </ListItem>
                                    )}
                                </List>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </StyledPaper>
        </Container>
    );
};

export default AdminProfile;

// Styled Paper component for the main container
const StyledPaper = styled(Paper)`
    margin-top: 32px;
    padding: 40px;
    border-radius: 20px;
    background-color: white;
`;

// Container for the profile picture and edit overlay
const ProfilePictureContainer = styled.div`
    position: relative;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 200px;
    border-radius: 50%;

    &:hover > div {
        opacity: 1;
    }
`;

// Overlay shown on hover to indicate edit action
const EditOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
`;

// Avatar styling for consistent size and appearance
const StyledAvatar = styled(Avatar)`
    width: 200px !important;
    height: 200px !important;
    font-size: 6rem;
    border: 4px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;
