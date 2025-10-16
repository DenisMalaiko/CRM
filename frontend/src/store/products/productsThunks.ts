import { createAsyncThunk } from '@reduxjs/toolkit';
import { TProduct } from "../../models/Product";
import {buildError} from "../../utils/apiError";
import {ApiResponse} from "../../models/ApiResponse";

export const createProduct = createAsyncThunk(
  'products/create',
  async (form: TProduct, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/products/create`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });

      const data: ApiResponse<TProduct> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  })

export const updateProduct = createAsyncThunk<
  ApiResponse<TProduct>,
  { id: string, form: TProduct, },
  { rejectValue: ApiResponse<null> }
>(
  'products/update',
  async ({ id, form }, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/products/update/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });

      const data: ApiResponse<TProduct> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  })

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/products/delete/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
      });

      const data: ApiResponse<TProduct> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  })


export const getProducts = createAsyncThunk<
  ApiResponse<TProduct[]>,
  void,
  { rejectValue: ApiResponse<null> }
>(
  'products/getProducts',
  async (_, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/products/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data: ApiResponse<TProduct[]> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
);