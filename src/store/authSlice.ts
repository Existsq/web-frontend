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
  initialized: true,
  error: null,
};

// Авторизация пользователя: после успешного логина сразу запрашиваем профиль пользователя
export const authLogin = createAsyncThunk(
  "auth/login",
  async (data: UserCredentialsDTO) => {
    await api.api.login(data);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const response = await api.api.getCurrentUser();
    return response.data;
  }
);

// Регистрация пользователя: после регистрации также получаем текущего пользователя
export const authRegister = createAsyncThunk(
  "auth/register",
  async (data: UserCredentialsDTO) => {
    await api.api.register(data);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const response = await api.api.getCurrentUser();
    return response.data;
  }
);

// Выход пользователя из системы
export const authLogout = createAsyncThunk(
  "auth/logout",
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

// Обновление профиля пользователя
export const authUpdateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: UserCredentialsDTO) => {
    const response = await api.api.updateUser(data);
    return response.data;
  }
);

// Смена пароля пользователя
export const authChangePassword = createAsyncThunk(
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
      .addCase(authLogin.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(authLogin.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(authLogin.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Login failed";
      })

      .addCase(authRegister.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(authRegister.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(authRegister.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Register failed";
      })
      // Обновление профиля
      .addCase(authUpdateProfile.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(authUpdateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(authUpdateProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Profile update failed";
      })
      // Смена пароля
      .addCase(authChangePassword.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(authChangePassword.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(authChangePassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Password change failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
