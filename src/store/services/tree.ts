import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { config } from "../../helpers/config";
import type { Asset, Company, Location } from "../../types";

type EntityTag = { type: "Company" | "Location" | "Asset"; id: string };

// funcao para construir as tags de cache do RTK Query
export const buildEntityTags = <T extends { id: string }>(
  type: EntityTag["type"],
  entities?: T[] | null,
): EntityTag[] => {
  const listTag: EntityTag = { type, id: "LIST" };

  if (!entities || entities.length === 0) {
    return [listTag];
  }

  return [...entities.map(({ id }) => ({ type, id })), listTag];
};

// funcao para construir as tags de invalidacao do RTK Query
export const buildAssetInvalidationTags = ({ id }: { id: string }) => [
  { type: "Asset" as const, id },
];

export const treeApi = createApi({
  reducerPath: "treeApi",
  baseQuery: fetchBaseQuery({ baseUrl: config.apiBaseUrl }),
  endpoints: (builder) => ({
    getCompanies: builder.query<Company[], void>({
      query: () => "/companies",
      providesTags: (result) => buildEntityTags("Company", result),
    }),
    getCompanyLocations: builder.query<Location[], string>({
      query: (companyId) => `/companies/${companyId}/locations`,
      providesTags: (result) => buildEntityTags("Location", result),
    }),
    getCompanyAssets: builder.query<Asset[], string>({
      query: (companyId) => `/companies/${companyId}/assets`,
      providesTags: (result) => buildEntityTags("Asset", result),
    }),
    // Esse endpoint não existe e foi criado somente para exemplificar o uso do invalidateTags
    // Dessa forma poderiamos modificar dados de algum item da nossa árvore e forçar a atualização automática
    // dos dados em cache.
    setCompanyAssetProperty: builder.mutation<
      Asset,
      Partial<Asset> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `/assets/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_, __, payload) => buildAssetInvalidationTags(payload),
    }),
  }),
  tagTypes: ["Company", "Location", "Asset"],
});

// Exporta os hooks gerados automaticamente para consumo direto nos componentes.
export const {
  useGetCompaniesQuery,
  useGetCompanyLocationsQuery,
  useGetCompanyAssetsQuery,
} = treeApi;
