import { createAsyncThunk } from '@reduxjs/toolkit';
import {TOrder} from "../../models/Order";
import {ApiResponse} from "../../models/ApiResponse";
import {buildError} from "../../utils/apiError";

export const createOrder = createAsyncThunk(
  'orders/create',
  async (form: TOrder, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

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


export const getOrders = createAsyncThunk<
  ApiResponse<TOrder[]>,
  void,
  { rejectValue: ApiResponse<null> }
>(
  'orders/getProducts',
  async (_, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/orders/`, {
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