import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiResponse } from "../../models/ApiResponse";
import { TClient } from "../../models/Client";
import { buildError } from "../../utils/apiError";
import type { RootState } from "../../store";

export const getClients = createAsyncThunk<
  ApiResponse<TClient[]>,
  void,
  { rejectValue: ApiResponse<null> }
>(
  'clients/getClients',
  async (_, { rejectWithValue, getState }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;
    const state = getState() as RootState;
    const user = state.authModule.user;

    try {
      const res = await fetch(`${API_URL}/clients/${user?.businessId}`, {
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

export const createClient = createAsyncThunk(
  'clients/create',
  async (form: TClient, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/clients/create`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });

      const data: ApiResponse<TClient> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  })

export const updateClient = createAsyncThunk<
  ApiResponse<TClient>,
  { id: string, form: TClient, },
  { rejectValue: ApiResponse<null> }
>(
  'clients/update',
  async ({ id, form }, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/clients/update/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });

      const data: ApiResponse<TClient> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  })


export const deleteClient = createAsyncThunk(
  'clients/delete',
  async (id: string, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/clients/delete/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
      });

      const data: ApiResponse<TClient> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  })
