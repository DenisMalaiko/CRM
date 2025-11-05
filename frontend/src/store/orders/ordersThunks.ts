import { createAsyncThunk } from '@reduxjs/toolkit';
import {TOrder} from "../../models/Order";
import {ApiResponse} from "../../models/ApiResponse";
import {buildError} from "../../utils/apiError";
import type { RootState } from "../../store";

export const getOrders = createAsyncThunk<
  ApiResponse<TOrder[]>,
  void,
  { rejectValue: ApiResponse<null> }
>(
  'orders/getProducts',
  async (_, { rejectWithValue, getState }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;
    const state = getState() as RootState;
    const user = state.authModule.user;

    try {
      const res = await fetch(`${API_URL}/orders/${user?.businessId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data: ApiResponse<TOrder[]> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (form: TOrder, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    console.log("SEND FORM ", form)

    try {
      const res = await fetch(`${API_URL}/orders/create`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });

      const data: ApiResponse<TOrder> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  })

export const updateOrder = createAsyncThunk<
  ApiResponse<TOrder>,
  { id: string, form: TOrder, },
  { rejectValue: ApiResponse<null> }
>(
  'orders/update',
  async ({ id, form }, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/orders/update/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });

      const data: ApiResponse<TOrder> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  })

export const deleteOrder = createAsyncThunk(
  'orders/delete',
  async (id: string, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/orders/delete/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
      });

      const data: ApiResponse<TOrder> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  })