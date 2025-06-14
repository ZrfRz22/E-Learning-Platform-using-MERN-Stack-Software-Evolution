// Import required modules and components from libraries and project files
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { Avatar, Paper, Box, IconButton } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlackButton, BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';

import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popup from '../../../components/Popup';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Access student and user state from Redux store
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    // Fetch all students when component mounts or when currentUser ID changes
    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    // Log any error to console
    if (error) {
        console.log(error);
    }

    // States for popup message box
    const [showPopup, setShowPopup] = React.useState(false);
    const [message, setMessage] = React.useState("");

    // Function to handle deletion of a user/student
    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllStudents(currentUser._id));
            });
    };

    // Define the table columns for students
    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    // Convert student data into a format suitable for rendering in table
    const studentRows = studentsList && studentsList.length > 0 && studentsList.map((student) => {
        const imageUrl = `${process.env.REACT_APP_BASE_URL}/uploads/student/${student.profilePic}`;
        
        return {
            name: (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={imageUrl} sx={{ mr: 2 }} />
                    {student.name}
                </Box>
            ),
            rollNum: student.rollNum,
            sclassName: student.sclassName.sclassName,
            id: student._id,
        };
    });

    // Component for action buttons for each student row
    const StudentButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];
        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        // Handle main button click based on selected dropdown option
        const handleClick = () => {
            if (selectedIndex === 0) {
                handleAttendance();
            } else if (selectedIndex === 1) {
                handleMarks();
            }
        };

        const handleAttendance = () => {
            navigate("/Admin/students/student/attendance/" + row.id);
        };

        const handleMarks = () => {
            navigate("/Admin/students/student/marks/" + row.id);
        };

        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };

        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };

        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }
            setOpen(false);
        };

        return (
            <>
                {/* Delete student */}
                <IconButton onClick={() => deleteHandler(row.id, "Student")}>
                    <PersonRemoveIcon color="error" />
                </IconButton>

                {/* View student details */}
                <BlueButton variant="contained" onClick={() => navigate("/Admin/students/student/" + row.id)}>
                    View
                </BlueButton>

                {/* Dropdown menu for additional actions */}
                <React.Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                        <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                        <BlackButton
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </BlackButton>
                    </ButtonGroup>

                    {/* Dropdown options */}
                    <Popper
                        sx={{ zIndex: 1 }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    disabled={index === 2}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </React.Fragment>
            </>
        );
    };

    // Floating action button (SpeedDial) actions
    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />,
            name: 'Add New Student',
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <PersonRemoveIcon color="error" />,
            name: 'Delete All Students',
            action: () => deleteHandler(currentUser._id, "Students")
        },
    ];

    return (
        <>
            {/* Show loading spinner */}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {/* If response exists, show Add Students button */}
                    {response ? (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={() => navigate("/Admin/addstudents")}>
                                Add Students
                            </GreenButton>
                        </Box>
                    ) : (
                        // Else show the table of students with speed dial
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            {Array.isArray(studentsList) && studentsList.length > 0 &&
                                <TableTemplate buttonHaver={StudentButtonHaver} columns={studentColumns} rows={studentRows} />
                            }
                            <SpeedDialTemplate actions={actions} />
                        </Paper>
                    )}
                </>
            )}

            {/* Show popup for alerts or info */}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowStudents;