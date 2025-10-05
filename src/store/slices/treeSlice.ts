import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { AssetFilterState, SensorType, TreeNode } from "../../types";
import { extractErrorMessage } from "../../helpers/errors";
import { applyTreeFilters, buildTree } from "../../helpers/tree";
import { treeApi } from "../services/tree";
import type { RootState } from "../index";

// Uma forma mais declarativa de representar o estado assíncrono.
type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

interface AsyncValue<TData> {
  status: AsyncStatus;
  data: TData;
  error: string | null;
}

const createInitialAsyncValue = <TData>(
  initialData: TData,
): AsyncValue<TData> => ({
  status: "idle",
  data: initialData,
  error: null,
});

// No estado mesmo fica só os dados que o usuário inputa na UI
// A princípio toda montagem da minha árvore vai ser feita pelos seletores
interface TreeState {
  selectedCompanyId: string | null;
  filters: AssetFilterState;
}

// Estado inicial sem empresa escolhida.
const createInitialFilters = (): AssetFilterState => ({
  searchTerm: "",
  sensorTypes: [],
  criticalOnly: false,
});

const initialState: TreeState = {
  selectedCompanyId: null,
  filters: createInitialFilters(),
};

const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    // Atualiza a empresa selecionada conforme interação do usuário no dropdown.
    selectCompany(state, action) {
      state.selectedCompanyId = action.payload as string;
      state.filters = createInitialFilters();
    },
    setSearchTerm(state, action) {
      state.filters.searchTerm = action.payload as string;
    },
    toggleSensorType(state, action) {
      const sensorType = action.payload as SensorType;
      const { sensorTypes } = state.filters;
      const index = sensorTypes.indexOf(sensorType);
      if (index >= 0) {
        sensorTypes.splice(index, 1);
      } else {
        sensorTypes.push(sensorType);
      }
    },
    setCriticalOnly(state, action) {
      state.filters.criticalOnly = action.payload as boolean;
    },
  },
  // extraReducers: (builder) => {
  // builder.addMatcher(
  //   // no caso de querer selecionar automaticamente a primeira empresa retornada
  //   // mas isso pode ser confuso para o usuário e cria uma complexidade desnecessária no first load
  //   // em uma aplicação real provavelmente já teria uma company selecionada anteriormente em um contexto mais amplo
  //   treeApi.endpoints.getCompanies.matchFulfilled,
  //   (state, { payload }) => {
  //     if (!state.selectedCompanyId && payload.length > 0) {
  //       state.selectedCompanyId = payload[0].id;
  //       state.filters = createInitialFilters();
  //     }
  //   },
  // );
  // },
});

export const treeReducer = treeSlice.reducer;

// Exporta a action síncrona utilizada pelos componentes do header.
export const {
  selectCompany,
  setSearchTerm,
  toggleSensorType,
  setCriticalOnly,
} = treeSlice.actions;

const selectRootState = (state: RootState) => state;

// Recupera o identificador da empresa atualmente selecionada.
export const selectSelectedCompanyId = (state: RootState) =>
  state.tree.selectedCompanyId;

export const selectFilterState = (state: RootState) => state.tree.filters;

// Busca, no cache do RTK Query, o resultado da query de localizações já filtrado
// pela empresa ativa. Retorna `undefined` quando não há empresa selecionada.
const selectLocationsQueryForSelectedCompany = createSelector(
  selectSelectedCompanyId,
  selectRootState,
  (companyId, state) =>
    companyId
      ? treeApi.endpoints.getCompanyLocations.select(companyId)(state)
      : undefined,
);

// Repete a estratégia acima para ativos, garantindo que cada empresa possua um
// cache independente de resposta e status.
const selectAssetsQueryForSelectedCompany = createSelector(
  selectSelectedCompanyId,
  selectRootState,
  (companyId, state) =>
    companyId
      ? treeApi.endpoints.getCompanyAssets.select(companyId)(state)
      : undefined,
);

// Combina localizações e ativos, tratando erros/carregamentos e montando a árvore
// final somente quando ambos os datasets estiverem disponíveis.
export const selectActiveTree = createSelector(
  [selectLocationsQueryForSelectedCompany, selectAssetsQueryForSelectedCompany],
  (locationsResult, assetsResult): AsyncValue<TreeNode[]> => {
    if (!locationsResult || !assetsResult) {
      return createInitialAsyncValue<TreeNode[]>([]);
    }

    if (locationsResult.isError) {
      return {
        status: "failed",
        data: [],
        error: extractErrorMessage(locationsResult.error),
      };
    }

    if (assetsResult.isError) {
      return {
        status: "failed",
        data: [],
        error: extractErrorMessage(assetsResult.error),
      };
    }

    if (locationsResult.isLoading || assetsResult.isLoading) {
      return {
        status: "loading",
        data: [],
        error: null,
      };
    }

    if (locationsResult.data && assetsResult.data) {
      return {
        status: "succeeded",
        data: buildTree(locationsResult.data, assetsResult.data),
        error: null,
      };
    }

    return createInitialAsyncValue<TreeNode[]>([]);
  },
);

// Atalho útil quando o componente só precisa dos nós, sem se importar com status/erro.
export const selectActiveTreeNodes = createSelector(
  selectActiveTree,
  (activeTree) => activeTree.data,
);

export const selectFilteredTreeNodes = createSelector(
  selectActiveTreeNodes,
  selectFilterState,
  (nodes, filters) => applyTreeFilters(nodes, filters),
);
