import { createAsyncThunk } from '@reduxjs/toolkit'

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async (credentials: { name: string; email: string, password: string }) => {
    const API_URL = process.env.REACT_APP_API;

    const res = await fetch(`${API_URL}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) throw new Error('Login failed')

    return await res.json();
  }
)