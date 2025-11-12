import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<TProduct[]>) => {
      state.products = action.payload;
    }
  }
});

export const { setProducts } = productSlice.actions;
export default productSlice.reducer;