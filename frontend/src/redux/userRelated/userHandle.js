import axios from 'axios';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice';

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Login`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.role) {
            dispatch(authSuccess(result.data));
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Reg`, fields, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Correctly differentiates between self-registration and admin-adding-user
        if (result.data.collegeName) {
            dispatch(authSuccess(result.data)); // Admin registering themselves
        } else if (result.data.name) {
            dispatch(stuffAdded(result.data));  // Admin adds student/teacher
        } else {
            dispatch(authFailed(result.data.message)); // Backend responded with failure
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch(authError(errorMessage));
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

 export const deleteUser = (id, address) => async (dispatch) => {
     dispatch(getRequest());

     try {
         const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
         if (result.data.message) {
             dispatch(getFailed(result.data.message));
         } else {
             dispatch(getDeleteSuccess());
         }
     } catch (error) {
         dispatch(getError(error));
     }
 }


//export const deleteUser = (id, address) => async (dispatch) => {
  //  dispatch(getRequest());
   // dispatch(getFailed("Sorry the delete function has been disabled for now."));
//}

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.collegeName) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${address}Create`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const updateUserProfilePic = (role, id, fields) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${role}ProfilePic/${id}`, fields, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (result.data) {
            dispatch(authSuccess(result.data)); // Profile pic updated, currentUser state refreshed
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch(authError(errorMessage));
    }
};