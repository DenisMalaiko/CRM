import { createAsyncThunk } from '@reduxjs/toolkit';
import { TBusiness } from "../../models/Business";
import { ApiResponse } from "../../models/ApiResponse";
import { buildError } from "../../utils/apiError";


export const getBusinessList = createAsyncThunk<
  ApiResponse<TBusiness[]>, void, { rejectValue: ApiResponse<null> }
>(
  'business/',
  async (_, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/business/`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
      });

      const data: ApiResponse<TBusiness[]> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
)

export const getBusiness = createAsyncThunk(
  'business/:id',
  async (id: string, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/business/${id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
      });

      const data: ApiResponse<TBusiness> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
)

export const createBusiness = createAsyncThunk(
  'business/create',
  async (credentials: TBusiness, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/business/create`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(credentials),
      });

      const data: ApiResponse<TBusiness> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
)

export const getUsersByBusinessId = createAsyncThunk(
  'business/users/:id',
  async (id: string, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/business/users/${id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
      });

      const data = await res.json();

      console.log("DATA ", data);

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
)