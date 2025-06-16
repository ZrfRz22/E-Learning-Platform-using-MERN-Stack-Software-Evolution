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
    const navigate = useNavigate(); // Hook for programmatic navigation
    const dispatch = useDispatch(); // Redux dispatch to trigger actions

    // Extracting necessary state from Redux store
    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user); // Current logged-in user

    // Fetch the list of subjects from the server when component mounts or when currentUser changes
    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    // Optional logging of errors for debugging
    if (error) {
        console.log(error);
    }

    // State variables to control popup message visibility and content
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    
    const deleteHandler = (deleteID, type = "Subject") => {
        const deleteAction = type === "Subjects" ? deleteSubjects : deleteSubject;

        dispatch(deleteAction(deleteID))
            .then(() => {
                // Refresh the subject list after successful deletion
                dispatch(getSubjectList(currentUser._id, "AllSubjects"));
            })
            .catch((err) => {
                // Handle deletion failure
                console.error("Delete failed:", err);
                setMessage("Failed to delete subject(s). Please try again.");
                setShowPopup(true);
            });
    };

    // Transform the raw subject list into a simplified object array for UI use
    const subjectRows = (subjectsList || []).map((subject) => {
        return {
            subName: subject.subName,                           // Subject name
            sessions: subject.sessions,                         // Number of sessions
            sclassName: subject.sclassName.sclassName,          // Class name
            sclassID: subject.sclassName._id,                   // Class ID
            id: subject._id                                      // Subject ID
        };
    });

    // Group the subjects by class name to structure them for grouped rendering
    const groupedSubjects = subjectRows.reduce((acc, subject) => {
        const className = subject.sclassName;

        // If the class group doesn't exist yet, initialize it
        if (!acc[className]) {
            acc[className] = [];
        }

        // Add subject to its corresponding class group
        acc[className].push(subject);
        return acc;
    }, {});

    // Reusable component to render buttons for each subject row.
    // Includes "Delete" and "View" buttons.
    const SubjectsButtonHaver = ({ row }) => {
        return (
            <ButtonContainer>
                {/* Delete icon triggers subject deletion */}
                <IconButton onClick={() => deleteHandler(row.id, "Subject")}>
                    <DeleteIcon color="error" />
                </IconButton>

                {/* View button navigates to detailed subject view */}
                <BlueButton
                    variant="contained"
                    onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                >
                    View
                </BlueButton>
            </ButtonContainer>
        );
    };

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