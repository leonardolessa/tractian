import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { treeApi } from "./services/tree";
import { treeReducer } from "./slices/treeSlice";

// store padrão com slice e middleware do RTK Query, nada especial
export const store = configureStore({
  reducer: {
    tree: treeReducer,
    [treeApi.reducerPath]: treeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(treeApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
