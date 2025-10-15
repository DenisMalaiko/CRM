import { createAsyncThunk } from '@reduxjs/toolkit';
import { TBusiness } from "../../models/Business";
import { ApiResponse } from "../../models/ApiResponse";
import { buildError } from "../../utils/apiError";

export const createBusiness = createAsyncThunk(
  'business/createBusiness',
  async (credentials: TBusiness, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/business/createBusiness`, {
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

export const getBusinessList = createAsyncThunk<
  ApiResponse<TBusiness[]>,
  void,
  { rejectValue: ApiResponse<null> }
>(
  'business/businessList',
  async (_, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/business/businessList`, {
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