import { createAsyncThunk } from '@reduxjs/toolkit'
import { IUser } from "../../models/User";

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async (credentials: IUser) => {
    const API_URL = process.env.REACT_APP_API;

    const res = await fetch(`${API_URL}/auth/signUp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!res.ok) throw new Error('Login failed')

    return await res.json();
  }
)