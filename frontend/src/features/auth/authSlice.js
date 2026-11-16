import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import { setAuthToken } from '../../utils/auth';
import { updateUserProfile } from '../users/userSlice';

// Backend login/register return `id`, while /auth/me returns `_id`.
// Keep both so every page can use either one.
const normalizeUser = (user) => (user ? { ...user, _id: user._id || user.id, id: user.id || user._id } : user);

const readStoredUser = () => {
  try {
    return normalizeUser(JSON.parse(localStorage.getItem('user')));
  } catch (e) {
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setAuthToken(null);
};

// After login/register, load the full profile (createdAt, phone, address...).
// If that fails we simply keep the basic user from the login response.
const hydrateUser = async (user) => {
  try {
    const me = await authAPI.getMe();
    const full = normalizeUser({ ...user, ...me.data.data });
    localStorage.setItem('user', JSON.stringify(full));
    return full;
  } catch (e) {
    return normalizeUser(user);
  }
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      const { token } = response.data;
      let user = normalizeUser(response.data.user);

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(token);
        user = await hydrateUser(user);
      }

      return { token, user, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        (error.request && !error.response ? 'Cannot reach the server. Is the backend running?' : 'Registration failed')
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { token } = response.data;
      let user = normalizeUser(response.data.user);

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(token);
        user = await hydrateUser(user);
      }

      return { token, user, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        (error.request && !error.response ? 'Cannot reach the server. Is the backend running?' : 'Login failed')
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // Logging out must always work: clear the local session first, then tell the
    // server on a best-effort basis (JWT logout is stateless anyway).
    const hadToken = !!localStorage.getItem('token');
    clearSession();
    if (hadToken) {
      try {
        await authAPI.logout();
      } catch (error) {
        /* ignore: the session is already cleared locally */
      }
    }
    return { message: 'Logged out successfully' };
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      const user = normalizeUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue('Failed to get user');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await authAPI.forgotPassword(email);
      return 'Password reset email sent';
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      const { token: newToken, user } = response.data;
      
      if (newToken) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(newToken);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Password reset failed');
    }
  }
);

// ADD THIS - Missing updatePassword thunk
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.updatePassword(currentPassword, newPassword);
      const { token, message } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
      }
      
      return { token, message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Failed to update password'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: localStorage.getItem('token') ? readStoredUser() : null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    message: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout: clear the user immediately (pending) so the UI updates without waiting for the network
      .addCase(logout.pending, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.message = 'Logged out successfully';
      })
      // Get Me
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state) => {
        // Token is invalid or expired: drop the stale session everywhere
        state.user = null;
        state.token = null;
        clearSession();
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.fulfilled, (state, action) => {
        if (action.payload.token) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Keep the logged-in user in sync after editing the profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user && action.payload && (state.user._id === action.payload._id)) {
          state.user = normalizeUser({ ...state.user, ...action.payload });
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      // Update Password - ADD THIS
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        if (action.payload.token) {
          state.token = action.payload.token;
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;