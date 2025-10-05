import React, { type ReactNode } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectCompany,
  setSearchTerm,
  treeReducer,
} from "../../../store/slices/treeSlice";
import { treeApi } from "../../../store/services/tree";

type TestStore = ReturnType<typeof createTestStore>;

const createTestStore = () =>
  configureStore({
    reducer: {
      tree: treeReducer,
      [treeApi.reducerPath]: treeApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(treeApi.middleware),
  });

const createWrapper =
  (store: TestStore) =>
  ({ children }: { children: ReactNode }) =>
    React.createElement(Provider, { store, children });

describe("store/hooks", () => {
  it("returns the dispatch function provided by the store", () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useAppDispatch(), { wrapper });

    act(() => {
      result.current(selectCompany("company-from-hook"));
    });

    expect(store.getState().tree.selectedCompanyId).toBe("company-from-hook");
  });

  it("subscribes to state updates with the global root typing", async () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(
      () => useAppSelector((state) => state.tree.filters.searchTerm),
      { wrapper },
    );

    expect(result.current).toBe("");

    act(() => {
      store.dispatch(setSearchTerm("motor"));
    });

    await waitFor(() => {
      expect(result.current).toBe("motor");
    });
  });
});
