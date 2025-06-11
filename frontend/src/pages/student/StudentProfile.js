import React, { useRef } from 'react'; // Import useRef
import styled from 'styled-components';
import { Card, CardContent, Typography, Container, Avatar, Badge, IconButton } from '@mui/material'; // Import Badge and IconButton
import { Edit } from '@mui/icons-material'; // Import Edit icon
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfilePic } from '../../redux/userRelated/userHandle'; // Import our new action

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

    // Construct the image URL if profilePic exists
    // Uses the role folder ('student') in this case
    const rolePath = currentUser.role.toLowerCase();
    const imageUrl = currentUser.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/student/${currentUser.profilePic}`
        : null;

    return (
      <Container maxWidth="md">
          {/* Hidden file input triggered by the edit button */}
          <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
          />

          {/* Profile card container */}
          <ProfileCard>
              <ProfileCardContent>

                  {/* Avatar with edit badge (pencil icon) */}
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
                      />
                  </Badge>

                  {/* Student information */}
                  <ProfileText variant="h5" component="h2">
                      {currentUser.name}
                  </ProfileText>
                  <ProfileText variant="subtitle1">
                      Student Roll No: {currentUser.rollNum}
                  </ProfileText>
                  <ProfileText variant="subtitle1">
                      Class: {currentUser.sclassName.sclassName}
                  </ProfileText>
                  <ProfileText variant="subtitle1">
                      College: {currentUser.college.collegeName}
                  </ProfileText>

              </ProfileCardContent>
          </ProfileCard>
      </Container>
  );
};

export default StudentProfile;

const ProfileCard = styled(Card)`
  margin: 20px auto;
  width: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ProfileCardContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileText = styled(Typography)`
  margin: 10px;
`;