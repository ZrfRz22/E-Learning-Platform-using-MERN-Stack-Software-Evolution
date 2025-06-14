import React, { useEffect, useState } from 'react';
import {
    IconButton, Box, Paper, Typography, Divider,
    List, ListItem, ListItemText
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { deleteSubject, deleteSubjects, getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

// Main component for displaying the list of subjects
const ShowSubjects = () => {
    const navigate = useNavigate(); // Navigation hook
    const dispatch = useDispatch(); // Redux dispatch function

    // Get state from Redux
    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    // Fetch subject list when component mounts or currentUser changes
    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    // Handle errors (optional logging)
    if (error) {
        console.log(error);
    }

    // Local state for popup message
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // Handler to delete either a single subject or all subjects
    const deleteHandler = (deleteID, type = "Subject") => {
        const deleteAction = type === "Subjects" ? deleteSubjects : deleteSubject;

        dispatch(deleteAction(deleteID))
            .then(() => {
                dispatch(getSubjectList(currentUser._id, "AllSubjects")); // Refresh list after delete
            })
            .catch((err) => {
                console.error("Delete failed:", err);
                setMessage("Failed to delete subject(s). Please try again.");
                setShowPopup(true);
            });
    };

    // Transform the subject list into a simpler format
    const subjectRows = (subjectsList || []).map((subject) => {
        return {
            subName: subject.subName,
            sessions: subject.sessions,
            sclassName: subject.sclassName.sclassName,
            sclassID: subject.sclassName._id,
            id: subject._id,
        };
    });

    // Group subjects by class name
    const groupedSubjects = subjectRows.reduce((acc, subject) => {
        const className = subject.sclassName;
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(subject);
        return acc;
    }, {});

    // Component for buttons in each subject row
    const SubjectsButtonHaver = ({ row }) => {
        return (
            <ButtonContainer>
                <IconButton onClick={() => deleteHandler(row.id, "Subject")}>
                    <DeleteIcon color="error" />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                >
                    View
                </BlueButton>
            </ButtonContainer>
        );
    };

    // Speed dial floating button actions
    const actions = [
        {
            icon: <PostAddIcon color="primary" />,
            name: 'Add New Subject',
            action: () => navigate("/Admin/subjects/chooseclass")
        },
        {
            icon: <DeleteIcon color="error" />,
            name: 'Delete All Subjects',
            action: () => deleteHandler(currentUser._id, "Subjects")
        }
    ];

    // Main JSX return
    return (
        <>
            {loading ? (
                // Show loading indicator
                <div>Loading...</div>
            ) : (
                <>
                    {response ? (
                        // Button shown if there is a response
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={() => navigate("/Admin/subjects/chooseclass")}>
                                Add Subjects
                            </GreenButton>
                        </Box>
                    ) : (
                        // Main subject list display
                        <Box sx={{ p: 3 }}>
                            {Array.isArray(subjectsList) && subjectsList.length > 0 ? (
                                <Box display="flex" flexDirection="column" gap={3}>
                                    {Object.entries(groupedSubjects).map(([className, subjectsInClass]) => (
                                        <ClassContainer key={className} elevation={3}>
                                            {/* Class name header */}
                                            <Box sx={{ bgcolor: '#FFA07A', color: 'black', p: 2 }}>
                                                <Typography fontSize="20px">
                                                    Class: {className}
                                                </Typography>
                                            </Box>

                                            {/* List of subjects under that class */}
                                            <List disablePadding>
                                                {subjectsInClass.map((row, index) => (
                                                    <React.Fragment key={row.id}>
                                                        <ListItem sx={{ py: 2 }}>
                                                            <ListItemText
                                                                primary={row.subName}
                                                                secondary={`Sessions: ${row.sessions}`}
                                                                primaryTypographyProps={{ variant: 'h6' }}
                                                            />
                                                            <SubjectsButtonHaver row={row} />
                                                        </ListItem>
                                                        {/* Divider between subjects */}
                                                        {index < subjectsInClass.length - 1 && <Divider component="li" />}
                                                    </React.Fragment>
                                                ))}
                                            </List>
                                        </ClassContainer>
                                    ))}
                                </Box>
                            ) : (
                                // Message when no subjects are found
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    No subjects found. Please add subjects to begin.
                                </Typography>
                            )}

                            {/* Floating action button */}
                            <SpeedDialTemplate actions={actions} />
                        </Box>
                    )}
                </>
            )}

            {/* Popup for error messages */}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowSubjects;

// --- STYLED COMPONENTS ---

// Custom styled Paper for class container
const ClassContainer = styled(Paper)`
    border-radius: 12px;
    overflow: hidden; 
`;

// Custom styled Box for button layout
const ButtonContainer = styled(Box)`
    display: flex;
    align-items: center;
    gap: 1rem;
`;