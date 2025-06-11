import React, { useRef } from 'react';
import styled from 'styled-components';
import { Card, CardContent, Typography, Avatar, Badge, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfilePic } from '../../redux/userRelated/userHandle';

const TeacherProfile = () => {
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

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

    // Construct image URL for the avatar
    const rolePath = currentUser.role.toLowerCase();
    const imageUrl = currentUser.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/${rolePath}/${currentUser.profilePic}`
        : null;

    return (
        <>
            {/* Hidden input for profile picture upload */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            <ProfileCard>
                <ProfileCardContent>

                    {/* Avatar with edit icon overlay */}
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <IconButton 
                                sx={{ backgroundColor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }} 
                                onClick={handleEditButtonClick}
                            >
                                <Edit color="primary" />
                            </IconButton>
                        }
                    >
                        <Avatar
                            alt={currentUser.name}
                            src={imageUrl}
                            sx={{ width: 150, height: 150, margin: '20px', fontSize: '5rem' }}
                        >
                            {/* Show first initial if no image */}
                            {currentUser.name.charAt(0)}
                        </Avatar>
                    </Badge>

                    {/* Display teacher's profile details */}
                    <ProfileText>Name: {currentUser.name}</ProfileText>
                    <ProfileText>Email: {currentUser.email}</ProfileText>
                    <ProfileText>Class: {teachSclass.sclassName}</ProfileText>
                    <ProfileText>Subject: {teachSubject.subName}</ProfileText>
                    <ProfileText>College: {teachCollege.collegeName}</ProfileText>

                </ProfileCardContent>
            </ProfileCard>
        </>
    );
};


export default TeacherProfile;

const ProfileCard = styled(Card)`
  margin: 20px auto;
  width: 400px;
  border-radius: 10px;
`;

const ProfileCardContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileText = styled(Typography)`
  margin: 10px;
`;