import { createAsyncThunk } from '@reduxjs/toolkit';
import { mockLogin, mockRegister } from '../../services/mockApi';
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
    return await mockLogin(payload.email, payload.password);
  } catch (error) {
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
    return await mockRegister(payload);
  } catch (error) {
    if (error instanceof Error) {
      return thunkAPI.rejectWithValue(error.message);
    }
    return thunkAPI.rejectWithValue('Unable to create account.');
  }
});
