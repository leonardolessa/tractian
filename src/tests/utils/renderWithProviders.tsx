import type { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render, type RenderOptions } from "@testing-library/react";

import { treeApi } from "../../store/services/tree";
import { treeReducer } from "../../store/slices/treeSlice";
import type { RootState } from "../../store";

export interface RenderWithProvidersOptions
  extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

const rootReducer = combineReducers({
  tree: treeReducer,
  [treeApi.reducerPath]: treeApi.reducer,
});

export const createTestStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(treeApi.middleware),
    preloadedState,
  });

export type AppStore = ReturnType<typeof createTestStore>;
export type AppDispatch = AppStore["dispatch"];

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    ...render(ui, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  };
}
