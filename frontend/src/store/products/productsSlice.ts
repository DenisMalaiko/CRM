import { createSlice } from '@reduxjs/toolkit';
import { getProducts } from './productsThunks';
import { TProduct } from "../../models/Product";

type ProductsState = {
  products: TProduct[] | null
  loading: boolean
  error: string | null | any
}

const initialState: ProductsState = {
  products: null,
  loading: false,
  error: null,
}

const products = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error';
      })
  }
})

export default products.reducer