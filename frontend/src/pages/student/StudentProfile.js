// Import necessary dependencies from React, Redux, Router, MUI, and styled-components
import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Avatar, Paper, Grid, Divider,
    List, ListItem, ListItemText
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import styled from 'styled-components';
import { updateUserProfilePic } from '../../redux/userRelated/userHandle';

const StudentProfile = () => {
    // Access the current logged-in user from Redux state
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    // Reference to the hidden file input element
    const fileInputRef = useRef(null);

    // Trigger the hidden file input when the edit button is clicked
    const handleEditButtonClick = () => {
        fileInputRef.current.click();
    };

    // Handle file selection and dispatch an action to update profile picture
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePic', file);

            // Dynamically use the user's role for dispatching the update
            dispatch(updateUserProfilePic(currentUser.role, currentUser._id, formData));
        }
    };

    // Reusable component to show each detail row (name, class, etc.)
    const DetailItem = ({ label, value }) => (
        <>
            <ListItem>
                <ListItemText
                    primary={label}
                    secondary={value || 'Not specified'} // Fallback if value is null
                    primaryTypographyProps={{ fontWeight: 'bold', color: 'text.primary' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem', color: 'text.secondary' }}
                />
            </ListItem>
            <Divider component="li" />
        </>
    );

    // Construct the image URL if profilePic exists
    // Uses the role folder ('student') in this case
    const rolePath = currentUser.role.toLowerCase();
    const imageUrl = currentUser.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/student/${currentUser.profilePic}`
        : null;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Hidden input for selecting new profile picture */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Main profile display section */}
            <StyledPaper elevation={4}>
                <Grid container spacing={4}>
                    {/* Left Column: Profile Picture and Name */}
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <ProfilePictureContainer onClick={handleEditButtonClick}>
                            <StyledAvatar src={imageUrl} />
                            {/* Hover overlay with edit icon */}
                            <EditOverlay>
                                <Edit sx={{ color: 'white' }} />
                                <Typography variant="caption" color="white">Change</Typography>
                            </EditOverlay>
                        </ProfilePictureContainer>

                        {/* Name and Role */}
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="h4" component="h2" fontWeight={600}>
                                {currentUser?.name}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Student
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Right Column: Student Details */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Student Details
                        </Typography>
                        <List disablePadding>
                            <DetailItem label="Name" value={currentUser?.name} />
                            <DetailItem label="Roll Number" value={currentUser?.rollNum} />
                            <DetailItem label="Class" value={currentUser?.sclassName?.sclassName} />
                            <DetailItem label="College" value={currentUser?.college?.collegeName} />
                        </List>
                    </Grid>
                </Grid>
            </StyledPaper>
        </Container>
    );
};

export default StudentProfile;

// Styled Components

// Custom Paper with padding and rounded corners
const StyledPaper = styled(Paper)`
    padding: 40px;
    border-radius: 20px;
`;

// Container for avatar with hover effect
const ProfilePictureContainer = styled.div`
    position: relative;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 200px;
    border-radius: 50%;

    // Show overlay when hovered
    &:hover > div {
        opacity: 1;
    }
`;

// Styled avatar with border and shadow
const StyledAvatar = styled(Avatar)`
    width: 200px !important;
    height: 200px !important;
    font-size: 6rem;
    border: 4px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

// Overlay that appears on hover with edit icon
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