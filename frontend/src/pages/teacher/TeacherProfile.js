// React and library imports
import React, { useEffect, useRef } from 'react';
import { updateUserProfilePic } from '../../redux/userRelated/userHandle';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container, Typography, Box, Avatar, Paper, Grid, Divider,
    List, ListItem, ListItemText, Table, TableBody, TableHead, Button
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import styled from 'styled-components';

const TeacherProfile = () => {
    const { currentUser, loading } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const navigate = useNavigate(); 

    // These come from the backend via populate() at login
    const teachSclass = currentUser.teachSclass;
    const teachSubject = currentUser.teachSubject;
    const teachCollege = currentUser.college;

    // Handle edit button click to open hidden file input
    const handleEditButtonClick = () => {
        fileInputRef.current.click();
    };

    // Handle file input change for profile picture update
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePic', file);
            dispatch(updateUserProfilePic(currentUser.role, currentUser._id, formData));
        }
    };

    // Navigate to subject assignment page
    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${currentUser?.teachSclass?._id}/${currentUser?._id}`);
    };

    // Construct image URL for the avatar
    const rolePath = currentUser.role.toLowerCase();
    const imageUrl = currentUser.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/${rolePath}/${currentUser.profilePic}`
        : null;

    // Component for rendering individual detail entries
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
                    {/* Hidden input for profile picture upload */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* Main profile layout */}
                    <StyledPaper elevation={4}>
                        <Grid container spacing={4}>
                            {/* Left Column - Profile Picture and Name */}
                            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <ProfilePictureContainer onClick={handleEditButtonClick}>
                                    <StyledAvatar src={imageUrl} />
                                    {/* Overlay shown on hover for editing */}
                                    <EditOverlay>
                                        <Edit sx={{ color: 'white' }} />
                                        <Typography variant="caption" color="white">Change</Typography>
                                    </EditOverlay>
                                </ProfilePictureContainer>
                                <Box sx={{ textAlign: 'center', mt: 2 }}>
                                    <Typography variant="h4" component="h2" fontWeight={600}>
                                        {currentUser?.name}
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Teacher
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* Right Column - User Details */}
                            <Grid item xs={12} md={8}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
                                    {/* Button shown only if class is assigned but subject is not */}
                                    {currentUser?.teachSclass?._id && !currentUser?.teachSubject?._id && (
                                        <Button variant="contained" onClick={handleAddSubject}>
                                            Add Subject
                                        </Button>
                                    )}
                                </Box>

                                {/* Display user details */}
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                    Teacher Details
                                </Typography>
                                <List disablePadding>
                                    <DetailItem label="Name" value={currentUser?.name} />
                                    <DetailItem label="Email" value={currentUser?.email} />
                                    <DetailItem label="Class Taught" value={currentUser?.teachSclass?.sclassName} />
                                    <DetailItem label="Subject Taught" value={currentUser?.teachSubject?.subName} />
                                </List>
                            </Grid>
                        </Grid>
                    </StyledPaper>
                </Container>
            )}
        </>
    );
};

export default TeacherProfile;

// --- Styled Components ---

// Styled container for entire profile card
const StyledPaper = styled(Paper)`
    padding: 40px;
    border-radius: 20px;
`;

// Additional card styling (not used in this file, may be reserved for future use)
const SummaryPaper = styled(Paper)`
    padding: 24px;
    border-radius: 16px;
    height: 100%;
`;

// Container for the profile picture with hover effect
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

// Avatar with custom size and border
const StyledAvatar = styled(Avatar)`
    width: 200px !important;
    height: 200px !important;
    font-size: 6rem;
    border: 4px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

// Overlay that appears when hovering the avatar (for edit prompt)
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