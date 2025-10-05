import { useEffect, useId, useRef, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { TreeView } from "./components/TreeView";
import { GlassCard } from "./components/_ui/GlassCard";
import { FormField } from "./components/_ui/FormField";
import { SelectInput } from "./components/_ui/SelectInput";
import { StatusBanner } from "./components/_ui/StatusBanner";
import { TextInput } from "./components/_ui/TextInput";
import { ToggleChip } from "./components/_ui/ToggleChip";
import { extractErrorMessage } from "./helpers/errors";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  useGetCompaniesQuery,
  useGetCompanyAssetsQuery,
  useGetCompanyLocationsQuery,
} from "./store/services/tree";
import {
  selectActiveTree,
  selectCompany,
  selectFilterState,
  selectFilteredTreeNodes,
  selectSelectedCompanyId,
  setCriticalOnly,
  setSearchTerm,
  toggleSensorType,
} from "./store/slices/treeSlice";

function App() {
  const dispatch = useAppDispatch();

  const {
    data: companies = [],
    isLoading: companiesLoading,
    isError: companiesFailed,
    error: companiesQueryError,
  } = useGetCompaniesQuery();

  const companiesErrorMessage = companiesQueryError
    ? extractErrorMessage(companiesQueryError)
    : null;

  const selectedCompanyId = useAppSelector(selectSelectedCompanyId);
  const activeTree = useAppSelector(selectActiveTree);
  const filters = useAppSelector(selectFilterState);
  const filteredTreeNodes = useAppSelector(selectFilteredTreeNodes);

  // quando tiver empresa selecionada, dispara as queries de locations e ativos.
  const companyQueryArg = selectedCompanyId ?? skipToken;
  useGetCompanyLocationsQuery(companyQueryArg);
  useGetCompanyAssetsQuery(companyQueryArg);

  // busca a entidade completa da empresa selecionada para renderizar no header.
  const selectedCompany =
    companies.find((company) => company.id === selectedCompanyId) ?? null;

  // caso a gente queira salvar o estado do search em localStorage, aqui já receberia o valor inicial
  const [searchInput, setSearchInput] = useState(filters.searchTerm);
  const skipNextSearchSyncRef = useRef(false);
  const debouncedSearchInput = useDebouncedValue(searchInput, 350);
  const companyFieldId = useId();
  const searchFieldId = useId();

  useEffect(() => {
    skipNextSearchSyncRef.current = true;
    setSearchInput(filters.searchTerm);
  }, [filters.searchTerm]);

  useEffect(() => {
    if (skipNextSearchSyncRef.current) {
      skipNextSearchSyncRef.current = false;
      return;
    }

    if (debouncedSearchInput !== filters.searchTerm) {
      dispatch(setSearchTerm(debouncedSearchInput));
    }
  }, [debouncedSearchInput, filters.searchTerm, dispatch]);

  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectCompany(event.target.value));
  };

  const handleEnergyToggle = () => {
    dispatch(toggleSensorType("energy"));
  };

  const handleCriticalToggle = () => {
    dispatch(setCriticalOnly(!filters.criticalOnly));
  };

  const energyFilterActive = filters.sensorTypes.includes("energy");

  // Define flags utilizadas para renderizar mensagens auxiliares na interface.
  const isTreeLoading = activeTree.status === "loading";
  const treeFailed = activeTree.status === "failed";

  return (
    <main className="bg-surface-950 text-surface-100 relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="bg-primary-500/25 pointer-events-none absolute inset-x-[-40%] top-[-30%] h-[520px] rounded-full blur-[180px]"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pt-12 pb-20 sm:px-8 sm:pt-16 sm:pb-24">
        <GlassCard
          as="header"
          topHeading="Central de ativos"
          heading={selectedCompany?.name ?? "Selecione uma empresa"}
          description="Explore a hierarquia completa dos ativos monitorados, ajustando buscas rápidas, sensores de energia e alertas críticos conforme necessário."
          actions={
            <div className="w-full max-w-md space-y-4 sm:w-auto">
              <FormField label="Empresa" htmlFor={companyFieldId}>
                <SelectInput
                  id={companyFieldId}
                  value={selectedCompanyId ?? ""}
                  onChange={handleCompanyChange}
                  disabled={companiesLoading || companies.length === 0}
                >
                  <option value="" disabled>
                    {companiesLoading
                      ? "Carregando empresas..."
                      : "Selecione uma empresa"}
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField
                label="Busca rápida"
                htmlFor={searchFieldId}
                description="Filtre por nome, ID, sensor ou gateway com atualização automática."
              >
                <TextInput
                  id={searchFieldId}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Buscar ativos, sensores ou setores"
                  leadingIcon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3-3" />
                    </svg>
                  }
                />
              </FormField>
              <FormField label="Filtros rápidos">
                <div className="mt-2 flex flex-wrap gap-2">
                  <ToggleChip
                    pressed={energyFilterActive}
                    onClick={handleEnergyToggle}
                  >
                    Sensores de energia
                  </ToggleChip>
                  <ToggleChip
                    pressed={filters.criticalOnly}
                    onClick={handleCriticalToggle}
                  >
                    Status crítico
                  </ToggleChip>
                </div>
              </FormField>
            </div>
          }
        />
        {companiesFailed ? (
          <StatusBanner tone="critical">
            {companiesErrorMessage ?? "Não foi possível carregar as empresas."}
          </StatusBanner>
        ) : null}
        {treeFailed && activeTree.error ? (
          <StatusBanner tone="critical">{activeTree.error}</StatusBanner>
        ) : null}
        <TreeView nodes={filteredTreeNodes} isLoading={isTreeLoading} />
      </div>
    </main>
  );
}

export default App;
