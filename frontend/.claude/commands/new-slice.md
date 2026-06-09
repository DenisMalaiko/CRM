Create a new Redux Toolkit slice + RTK Query API for the domain `$ARGUMENTS`.

## Steps

1. Create directory `src/store/$ARGUMENTS/`
2. Create the slice file `src/store/$ARGUMENTS/$ARGUMENTSSlice.ts`:

```ts
import { createSlice } from '@reduxjs/toolkit';

type ${ARGUMENTS}State = {
  // TODO: define state
};

const initialState: ${ARGUMENTS}State = {
  // TODO: initial values
};

const ${ARGUMENTS}Slice = createSlice({
  name: '$ARGUMENTS',
  initialState,
  reducers: {
    // TODO: add reducers
  },
});

export const { /* actions */ } = ${ARGUMENTS}Slice.actions;
export default ${ARGUMENTS}Slice.reducer;
```

3. Create the API file `src/store/$ARGUMENTS/$ARGUMENTSApi.ts`:

```ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../api/baseQuery';

export const ${ARGUMENTS}Api = createApi({
  reducerPath: '${ARGUMENTS}Api',
  baseQuery,
  tagTypes: ['$ARGUMENTS'],
  endpoints: (builder) => ({
    // TODO: add endpoints
  }),
});
```

4. Register the slice and API middleware in `src/store/index.ts`
5. Ask me what endpoints and state fields are needed
