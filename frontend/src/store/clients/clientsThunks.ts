import { createAsyncThunk } from '@reduxjs/toolkit';

export const getClients = createAsyncThunk(
  'clients/getClients',
  async (_, { rejectWithValue }) => {
    console.log("GET CLIENTS")
  }
)