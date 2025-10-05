import type { Company } from "../../types/company";

let companySequence = 0;

/**
 * Generates a company entity with a predictable id/name pattern unless
 * overridden explicitly. Ideal for tests that only care about identifiers.
 */
export const buildCompany = (overrides: Partial<Company> = {}): Company => {
  const id = overrides.id ?? `company-${++companySequence}`;
  const name = overrides.name ?? `Company ${companySequence}`;

  return {
    id,
    name,
  };
};

/**
 * Produces a fixed list of companies, useful for dropdown or selection tests.
 */
export const createCompanyListFixture = (): Company[] => [
  buildCompany({ id: "company-alpha", name: "Alpha Industries" }),
  buildCompany({ id: "company-beta", name: "Beta Manufacturing" }),
];

export const resetCompanySequence = () => {
  companySequence = 0;
};
