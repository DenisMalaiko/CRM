import { createAsyncThunk } from "@reduxjs/toolkit";
import { TAdmin } from "../../models/User";
import { ApiResponse } from "../../models/ApiResponse";
import { buildError } from "../../utils/apiError";

export const signUpAdmin = createAsyncThunk(
  'admin/signUp',
  async (credentials: TAdmin, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/admin/signUp`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(credentials),
      });

      const data: ApiResponse<TAdmin> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
);