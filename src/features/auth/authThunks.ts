import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginRequest, registerRequest } from './authService';
import type { UserProfile } from './types';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: UserProfile['role'];
  institution: string;
  department: string;
};

export const loginUser = createAsyncThunk<
  { user: UserProfile; token: string },
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (payload, thunkAPI) => {
  try {
    return await loginRequest(payload.email, payload.password);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return thunkAPI.rejectWithValue(error.response?.data?.message ?? error.message);
    }
    if (error instanceof Error) {
      return thunkAPI.rejectWithValue(error.message);
    }
    return thunkAPI.rejectWithValue('Unable to sign in.');
  }
});

export const registerUser = createAsyncThunk<
  { user: UserProfile; token: string },
  RegisterCredentials,
  { rejectValue: string }
>('auth/register', async (payload, thunkAPI) => {
  try {
    return await registerRequest(payload);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return thunkAPI.rejectWithValue(error.response?.data?.message ?? error.message);
    }
    if (error instanceof Error) {
      return thunkAPI.rejectWithValue(error.message);
    }
    return thunkAPI.rejectWithValue('Unable to create account.');
  }
});
