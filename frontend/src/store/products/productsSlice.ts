import { createSlice } from '@reduxjs/toolkit'
import { Product } from "../../models/Product";

type ProductsState = {
  products: Product[]
}

const initialState: ProductsState = {
  products: [],
}

const products = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
  }
})

export default products.reducer