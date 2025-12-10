import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import type { UserCredentialsDTO } from "../api";
import axios from "axios";

export interface User {
  id?: number;
  username?: string;
  email?: string;
  moderator?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  initialized: false,
  error: null,
};

// Login: после успешного логина сразу запрашиваем профиль пользователя
export const login = createAsyncThunk(
  "auth/login",
  async (data: UserCredentialsDTO) => {
    await api.api.login(data);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const response = await api.api.getCurrentUser();
    return response.data;
  }
);

// Register: после регистрации также получаем текущего пользователя
export const register = createAsyncThunk(
  "auth/register",
  async (data: UserCredentialsDTO) => {
    await api.api.register(data);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const response = await api.api.getCurrentUser();
    return response.data;
  }
);

// Get current user
export const getMe = createAsyncThunk("auth/me", async () => {
  const response = await api.api.getCurrentUser();
  return response.data;
});

// Logout
export const logoutAsync = createAsyncThunk(
  "auth/logoutAsync",
  async (_, { dispatch }) => {
    try {
      await api.api.logout();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logout());
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: UserCredentialsDTO) => {
    const response = await api.api.updateUser(data);
    return response.data;
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: { oldPassword: string; newPassword: string }) => {
    const response = await axios.post(
      "/api/users/change-password",
      data,
      { withCredentials: true }
    );
    return response.data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Login failed";
      })

      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Register failed";
      })

      .addCase(getMe.pending, (s) => {
        s.initialized = false;
      })
      .addCase(getMe.fulfilled, (s, a) => {
        s.user = a.payload;
        s.initialized = true;
      })
      .addCase(getMe.rejected, (s) => {
        s.user = null;
        s.initialized = true;
      })
      // update profile
      .addCase(updateProfile.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(updateProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Profile update failed";
      })
      // change password
      .addCase(changePassword.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(changePassword.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(changePassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Password change failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
