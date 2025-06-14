import React, { useEffect, useState } from 'react';
import { IconButton, Box, Paper, Typography, Collapse, Button, Divider } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import styled from 'styled-components';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const ShowNotices = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux states
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user);

    // Fetch notices when component mounts
    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    // Local states
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [expanded, setExpanded] = useState({}); // Track expanded/collapsed state for each notice

    // Log any errors to console (can be improved to show a popup)
    if (error) {
        console.log(error);
    }

    // Delete a single notice or all notices based on ID and type
    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllNotices(currentUser._id, "Notice")); // Refresh notices
            });
    };

    // Toggle expansion of a notice's details
    const handleToggle = (noticeId) => {
        setExpanded(prev => ({ ...prev, [noticeId]: !prev[noticeId] }));
    };

    // Map raw notices to a format suitable for display
    const noticeRows = (noticesList || []).map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            id: notice._id,
        };
    });

    // Speed dial FAB actions (bottom-right corner)
    const actions = [
        {
            icon: <NoteAddIcon color="primary" />, name: 'Add New Notice',
            action: () => navigate("/Admin/addnotice")
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Notices',
            action: () => deleteHandler(currentUser._id, "Notices")
        }
    ];

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Box sx={{ p: 3 }}>
                    {/* If response exists, show add button */}
                    {response ? (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={() => navigate("/Admin/addnotice")}>
                                Add Notice
                            </GreenButton>
                        </Box>
                    ) : (
                        <>
                            {/* Display notices if available */}
                            {Array.isArray(noticesList) && noticesList.length > 0 ? (
                                <NoticeContainer>
                                    {noticeRows.map((notice) => (
                                        <NoticeCard key={notice.id} elevation={3}>
                                            <CardHeader sx={{ bgcolor: '#FFA07A', color: 'black', p: 2 }}>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '30px' }}>{notice.title}</Typography>
                                                    <Typography variant="caption" color="textSecondary" fontSize="15px">
                                                        {notice.date}
                                                    </Typography>
                                                </Box>
                                                <IconButton onClick={() => deleteHandler(notice.id, "Notice")}>
                                                    <DeleteIcon color="error" />
                                                </IconButton>
                                            </CardHeader>

                                            <Divider />

                                            {/* Collapse for showing notice details */}
                                            <Collapse in={expanded[notice.id] || false} timeout="auto" unmountOnExit>
                                                <CardContent>
                                                    <Typography variant="body1">{notice.details}</Typography>
                                                </CardContent>
                                            </Collapse>

                                            {/* Expand/Collapse toggle button */}
                                            <CardActions>
                                                <Button
                                                    onClick={() => handleToggle(notice.id)}
                                                    endIcon={expanded[notice.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                >
                                                    {expanded[notice.id] ? "Show Less" : "Show More"}
                                                </Button>
                                            </CardActions>
                                        </NoticeCard>
                                    ))}
                                </NoticeContainer>
                            ) : (
                                // Message when no notices exist
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
                                    <Typography variant="h6">No notices found.</Typography>
                                    <GreenButton
                                        variant="contained"
                                        onClick={() => navigate("/Admin/addnotice")}
                                        sx={{ mt: 2 }}
                                    >
                                        Add Notice
                                    </GreenButton>
                                </Box>
                            )}
                        </>
                    )}

                    {/* Floating action button for quick actions */}
                    {Array.isArray(noticesList) && noticesList.length > 0 && (
                        <SpeedDialTemplate actions={actions} />
                    )}
                </Box>
            )}

            {/* Error or info popup */}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowNotices;

// --- Styled Components ---

// Container for all notices
const NoticeContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

// Each notice card styling
const NoticeCard = styled(Paper)`
    border-radius: 12px;
    overflow: hidden;
`;

// Header section of the notice card
const CardHeader = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
`;

// Content section for details
const CardContent = styled(Box)`
    padding: 24px;
    white-space: pre-wrap;
    word-wrap: break-word;
`;

// Actions section with "Show More/Less" button
const CardActions = styled(Box)`
    display: flex;
    justify-content: flex-end;
    padding: 8px 16px;
    border-top: 1px solid #f0f0f0;
`;
