import { createAsyncThunk } from '@reduxjs/toolkit';
import { TProduct } from "../../models/Product";
import {buildError} from "../../utils/apiError";
import {ApiResponse} from "../../models/ApiResponse";

export const createProducts = createAsyncThunk(
  'products/createProduct',
  async (form: TProduct, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;
    console.log("FETCH CREATE PRODUCT", form)

    try {
      const res = await fetch(`${API_URL}/products/createProduct`, {
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

export const getProducts = createAsyncThunk<
  ApiResponse<TProduct[]>,
  void,
  { rejectValue: ApiResponse<null> }
>(
  'products/getProducts',
  async (_, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;
    console.log("FETCH GET PRODUCTS");

    try {
      const res = await fetch(`${API_URL}/products/getProducts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data: ApiResponse<TProduct[]> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      console.log("START GET PRODUCTS")
      console.log(data)
      console.log("END GET PRODUCTS")

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
);