import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Container, Typography, Box, Avatar, Paper, IconButton, Badge } from '@mui/material';
import { Edit } from '@mui/icons-material';

// import the update profile picture function
import { updateUserProfilePic } from '../../redux/userRelated/userHandle'; 

const AdminProfile = () => {
    const { currentUser } = useSelector((state) => state.user); // Get logged-in user from Redux store
    const dispatch = useDispatch();

    const fileInputRef = useRef(null); // Ref to trigger hidden file input

    //  Profile Picture Preview URL  
    // If a profile picture exists, dynamically build the full image URL from env + path
    const imageUrl = currentUser.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/admin/${currentUser.profilePic}`
        : null;

    //  Handle Edit Button Click 
    // This triggers the hidden file input for uploading a new profile picture
    const handleEditButtonClick = () => {
        fileInputRef.current.click();
    };

    //  Handle File Selection 
    const handleFileChange = async (event) => {
        const file = event.target.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('profilePic', file); // Append selected image to form data

            // Dispatch an action to update the profile picture
            // This uses a dynamic role (e.g., admin, teacher, student) from the current user
            dispatch(updateUserProfilePic(currentUser.role, currentUser._id, formData));
        }
    };

    return (
        <Container maxWidth="md">
            <StyledPaper elevation={3}>
                <Box display="flex" flexDirection="column" alignItems="center" padding={5}>
                    
                    {/* Hidden File Input for Image Upload */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileChange} // Triggers when user selects an image
                    />

                    {/* Avatar with Edit Icon Badge */}
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <IconButton
                                sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f0f0f0' } }}
                                onClick={handleEditButtonClick} // Opens file picker
                            >
                                <Edit color="primary" />
                            </IconButton>
                        }
                    >
                        {/* Display Avatar */}
                        <Avatar
                            src={imageUrl} // Show uploaded profile picture if available
                            sx={{ width: 150, height: 150, marginBottom: 2, fontSize: '4rem' }}
                        >
                        </Avatar>
                    </Badge>
                    <Typography variant="h5" component="h2" mt={3}>
                        {currentUser.name}
                    </Typography>
                    <Typography variant="subtitle1">
                        Email: {currentUser.email}
                    </Typography>
                    <Typography variant="subtitle1">
                        College: {currentUser.collegeName}
                    </Typography>
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default AdminProfile;

const StyledPaper = styled(Paper)`
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
`;