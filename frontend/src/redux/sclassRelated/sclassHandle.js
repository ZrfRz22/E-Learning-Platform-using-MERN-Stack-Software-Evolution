import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getStudentsSuccess,
    detailsSuccess,
    getFailedTwo,
    getSubjectsSuccess,
    getSubDetailsSuccess,
    getSubDetailsRequest,
    sclassActions,
    getTeachersSuccess,
    setResponse
} from './sclassSlice';

export const getAllSclasses = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}List/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getClassStudents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getStudentsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getClassDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(detailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSubjectList = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getTeacherFreeClassSubjects = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/FreeSubjectList/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSubjectDetails = (id, address) => async (dispatch) => {
    dispatch(getSubDetailsRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(getSubDetailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

// Action to delete a single subject by subject ID
export const deleteSubject = (subjectID) => async (dispatch) => {
    dispatch(getRequest()); // Dispatch request state (e.g., show loader)

    try {
        // Send DELETE request to backend to delete the subject
        const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/Subject/${subjectID}`);

        // Check if deletion was successful
        if (response.status === 200) {
            console.log('Subject deleted successfully.');
        } else {
            throw new Error('Subject deletion failed with non-200 response.');
        }
    } catch (error) {
        // Log and dispatch error
        console.error('Delete error:', error.message);
        dispatch(getError(error.message || 'Failed to delete subject.'));
    }
};

// Action to delete all subjects associated with a user (e.g., Admin)
export const deleteSubjects = (userId) => async (dispatch) => {
    try {
        dispatch(sclassActions.getRequest()); // Dispatch request state

        // Send DELETE request to delete all subjects for a user
        await axios.delete(`${process.env.REACT_APP_BASE_URL}/Subjects/${userId}`);

        // Optionally dispatch a response action to update UI
        dispatch(sclassActions.setResponse(true)); // You need to define setResponse in your reducer

        // Refresh the subject list after successful deletion
        dispatch(getSubjectList(userId, "AllSubjects"));
    } catch (error) {
        // Dispatch error message
        dispatch(sclassActions.getError(error.response?.data?.message || error.message));
    }
};

// Action to delete all subjects by class (e.g., bulk delete subjects belonging to a class)
export const deleteSubjectsByClass = (userId) => async (dispatch) => {
    try {
        dispatch(sclassActions.getRequest()); // Dispatch request state

        // Send DELETE request to backend to delete subjects by class
        await axios.delete(`${process.env.REACT_APP_BASE_URL}/SubjectsClass/${userId}`);

        // Optionally dispatch a response to update UI
        dispatch(setResponse(true)); // Ensure setResponse is defined in your slice/reducer

        // Refresh the subject list after successful deletion
        dispatch(getSubjectList(userId, "AllSubjects"));
    } catch (error) {
        // Dispatch error message
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

// This function fetches the list of teachers for a specific class from the backend
// It is a Redux Thunk action creator (returns a function that accepts dispatch)
export const getClassTeachers = (classID) => async (dispatch) => {
    // Dispatch an action to indicate the start of a GET request (typically sets loading = true)
    dispatch(getRequest());

    try {
        // Send a GET request to fetch teachers for the given classID
        const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/Sclass/Teachers/${classID}`, // API endpoint for fetching class teachers
            {
                headers: {
                    // Include the token from localStorage in the Authorization header
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        
        // If the response contains a 'message' key, it's likely an error message
        if (response.data.message) {
            // Dispatch an action to indicate failure with a specific message
            dispatch(getFailedTwo(response.data.message));
        } else {
            // Dispatch an action to store the teachers' data in the Redux store
            dispatch(getTeachersSuccess(response.data));
        }
    } catch (error) {
        // If the request fails,dispatch an error action with the error message
        dispatch(getError(error.response?.data?.message || "Failed to fetch teachers"));
    }
};





