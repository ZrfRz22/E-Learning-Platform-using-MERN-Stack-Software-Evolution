// Import necessary React hooks and MUI components
import React, { useEffect, useState } from 'react';
import {
    IconButton, Box, Menu, MenuItem, ListItemIcon, Tooltip, Grid, Paper,
    Typography, Avatar
} from '@mui/material';

// Import MUI icons
import DeleteIcon from "@mui/icons-material/Delete";
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddCardIcon from '@mui/icons-material/AddCard';

// Redux-related imports
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

// Custom components and styles
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import styled from 'styled-components';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

// Main component
const ShowClasses = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Access data from Redux store
    const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);
    const adminID = currentUser._id;

    // Fetch all classes on component mount
    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // Handle class deletion
    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                // Refresh class list after deletion
                dispatch(getAllSclasses(adminID, "Sclass"));
            });
    };

    // Button group for each class card
    const SclassButtonHaver = ({ row }) => {
        const actions = [
            { icon: <PostAddIcon />, name: 'Add Subjects', action: () => navigate("/Admin/addsubject/" + row.id) },
            { icon: <PersonAddAlt1Icon />, name: 'Add Student', action: () => navigate("/Admin/class/addstudents/" + row.id) },
        ];
        return (
            <ButtonContainer>
                <IconButton onClick={() => deleteHandler(row.id, "Sclass")} color="secondary">
                    <DeleteIcon color="error" />
                </IconButton>
                <BlueButton variant="contained"
                    onClick={() => navigate("/Admin/classes/class/" + row.id)}>
                    View
                </BlueButton>
                <ActionMenu actions={actions} />
            </ButtonContainer>
        );
    };

    // Dropdown menu for adding students and subjects
    const ActionMenu = ({ actions }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);

        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };

        return (
            <>
                <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                    <Tooltip title="Add Students & Subjects">
                        <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
                            <SpeedDialIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{ elevation: 0, sx: styles.styledPaper }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    {actions.map((action, index) => (
                        <MenuItem key={index} onClick={action.action}>
                            <ListItemIcon>{action.icon}</ListItemIcon>
                            {action.name}
                        </MenuItem>
                    ))}
                </Menu>
            </>
        );
    };

    // Floating action button actions
    const pageActions = [
        {
            icon: <AddCardIcon color="primary" />, name: 'Add New Class',
            action: () => navigate("/Admin/addclass")
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Classes',
            action: () => deleteHandler(adminID, "Sclasses")
        },
    ];

    // Convert string into color (used for avatar background)
    const stringToColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {getresponse ? (
                        // Show button to add new class after a successful response
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={() => navigate("/Admin/addclass")}>
                                Add Class
                            </GreenButton>
                        </Box>
                    ) : (
                        <>
                            {Array.isArray(sclassesList) && sclassesList.length > 0 ? (
                                // Render list of classes in a responsive grid
                                <Box sx={{ p: 3 }}>
                                    <Grid container spacing={4}>
                                        {sclassesList.map((sclass) => {
                                            const classData = {
                                                name: sclass.sclassName,
                                                id: sclass._id,
                                            };
                                            return (
                                                <Grid item xs={12} sm={6} md={4} key={sclass._id}>
                                                    <ClassCard elevation={3}>
                                                        <CardHeader>
                                                            <StyledAvatar sx={{ bgcolor: stringToColor(sclass.sclassName) }}>
                                                                {sclass.sclassName.charAt(0).toUpperCase()}
                                                            </StyledAvatar>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                                {classData.name}
                                                            </Typography>
                                                        </CardContent>
                                                        <CardActions>
                                                            <SclassButtonHaver row={classData} />
                                                        </CardActions>
                                                    </ClassCard>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </Box>
                            ) : (
                                // Show message if no class exists
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                                    <Typography variant="h4" gutterBottom>
                                        No Classes Found
                                    </Typography>
                                    <GreenButton variant="contained" onClick={() => navigate("/Admin/addclass")}>
                                        Add a Class
                                    </GreenButton>
                                </Box>
                            )}
                            <SpeedDialTemplate actions={pageActions} />
                        </>
                    )}
                </>
            )}
            {/* Popup notification component */}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowClasses;

// Styled card component for class display
const ClassCard = styled(Paper)`
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    overflow: hidden;
`;

// Header section of the card (holds the avatar)
const CardHeader = styled(Box)`
    width: 100%;
    height: 200px; 
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
`;

// Styled avatar with full size and centered content
const StyledAvatar = styled(Avatar)`
    width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important; 
    font-size: 4rem !important;
    display: flex;
    justify-content: center;
    align-items: center;
`;

// Main content section of the card
const CardContent = styled(Box)`
    padding: 10px;
    text-align: center;
    flex-grow: 1;
`;

// Button container at the bottom of the card
const CardActions = styled(Box)`
    border-top: 1px solid #f0f0f0;
    padding: 12px;
`;

// Container to hold buttons (View, Delete, Menu)
const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
`;

// Custom style for dropdown menu
const styles = {
    styledPaper: {
        overflow: 'visible',
        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
        mt: 1.5,
        '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
        },
        '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
        },
    },
};
