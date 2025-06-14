import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    ListItemButton,
    CircularProgress
} from '@mui/material';
import { Edit } from '@mui/icons-material';

// Redux actions
import { updateUserProfilePic } from '../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';

const AdminProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Ref for file input element

    const { currentUser } = useSelector((state) => state.user);
    const { sclassesList, loading: sclassLoading } = useSelector((state) => state.sclass);

    // Fetch classes managed by the current admin when component mounts
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
        }
    }, [dispatch, currentUser]);

    // Build the profile image URL (or fallback to null)
    const imageUrl = currentUser.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/admin/${currentUser.profilePic}`
        : null;

    // Trigger the hidden file input on avatar click
    const handleEditButtonClick = () => {
        fileInputRef.current.click();
    };

    // Handle profile picture change and dispatch Redux action
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePic', file);
            dispatch(updateUserProfilePic(currentUser.role, currentUser._id, formData));
        }
    };

    // Reusable component to display profile detail items
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
                    {/* Profile Picture and Name Section */}
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

                    {/* Profile Details and Managed Classes Section */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            Admin Details
                        </Typography>
                        <List disablePadding>
                            <DetailItem label="Name" value={currentUser.name} />
                            <DetailItem label="Email" value={currentUser.email} />
                            <DetailItem label="College" value={currentUser.collegeName} />
                        </List>

                        {/* Classes Managed by Admin */}
                        <Box mt={4}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                Managed Classes
                            </Typography>
                            {sclassLoading ? (
                                <CircularProgress />
                            ) : (
                                <Paper sx={{ mt: 2 }}>
                                    <List disablePadding>
                                        {sclassesList && sclassesList.length > 0 ? (
                                            sclassesList.map((classItem, index) => (
                                                <React.Fragment key={classItem._id}>
                                                    <ListItemButton 
                                                        onClick={() => navigate(`/Admin/classes/class/${classItem._id}`)}
                                                        sx={{ mt: 1 }}
                                                    >
                                                        <ListItemText
                                                            primary={classItem.sclassName}
                                                            primaryTypographyProps={{ fontWeight: 'bold' }}
                                                        />
                                                    </ListItemButton>
                                                    {index < sclassesList.length - 1 && <Divider />}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <ListItem>
                                                <ListItemText primary="No classes found." />
                                            </ListItem>
                                        )}
                                    </List>
                                </Paper>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </StyledPaper>
        </Container>
    );
};

export default AdminProfile;

// Styled Components

// Paper container styling
const StyledPaper = styled(Paper)`
    margin-top: 32px;
    padding: 40px;
    border-radius: 20px;
    background-color: white;
`;

// Profile picture container with hover overlay
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

// Overlay to indicate profile picture can be changed
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

// Avatar styling
const StyledAvatar = styled(Avatar)`
    width: 200px !important;
    height: 200px !important;
    font-size: 6rem;
    border: 4px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;