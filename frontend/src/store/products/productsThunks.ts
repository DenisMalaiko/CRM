import { createAsyncThunk } from '@reduxjs/toolkit';
import { Product } from "../../models/Product";

export const createProducts = createAsyncThunk(
  'products/getProducts',
  async (form: Product) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;
    console.log("FETCH CREATE PRODUCT", form)

  })