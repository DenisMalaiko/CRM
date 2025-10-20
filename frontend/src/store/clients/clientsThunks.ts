import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiResponse } from "../../models/ApiResponse";
import { TClient } from "../../models/Client";
import { buildError } from "../../utils/apiError";

export const getClients = createAsyncThunk<
  ApiResponse<TClient[]>,
  void,
  { rejectValue: ApiResponse<null> }
>(
  'clients/getClients',
  async (_, { rejectWithValue }) => {
    console.log("GET CLIENTS")
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/clients/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data: ApiResponse<TClient[]> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
)