import type {
  Asset,
  AssetFilterState,
  ComponentAsset,
  NonComponentAsset,
  Location,
  TreeNode,
} from "../types";

/**
 * Função que além de determinar se o asset é um componente, também tipa nosso Asset como ComponentAsset
 *
 * @param asset - Registro de ativo recebido da API.
 * @returns `true` quando o ativo possui metadados de sensor válidos.
 */
const isComponent = (asset: Asset): asset is ComponentAsset => {
  // Consideramos um ativo como componente quando a API informa um tipo de sensor.
  // Ao validar explicitamente contra `null` e `undefined` garantimos compatibilidade
  // com respostas onde o campo pode vir omitido ou com valor vazio.
  return asset.sensorType !== null && asset.sensorType !== undefined;
};

/**
 * Função que garante que o dado fique estável e consistente para uso na árvore.
 * Funciona mais como uma camada de proteção contra dados inesperados.
 * Além disso converte o ativo para o tipo específico de `NonComponentAsset`.
 *
 * @param asset - Ativo retornado pela API, possivelmente sem todos os campos opcionais.
 * @returns Estrutura de equipamento pronta para consumo na árvore.
 */
const toNonComponentAsset = (asset: Asset): NonComponentAsset => {
  return {
    id: asset.id,
    name: asset.name,
    locationId: asset.locationId ?? null,
    parentId: asset.parentId ?? null,
    // Equipamentos não possuem metadados de sensor.
    sensorId: null,
    sensorType: null,
    status: null,
  };
};

/**
 * Função que garante que o dado fique estável e consistente para uso na árvore.
 * Funciona mais como uma camada de proteção contra dados inesperados.
 *
 * @param asset - Componente já identificado pela função isComponent
 * @returns Estrutura de componente normalizada para uso na árvore.
 */
const toComponentAsset = (asset: ComponentAsset): ComponentAsset => {
  return {
    id: asset.id,
    name: asset.name,
    locationId: asset.locationId ?? null,
    parentId: asset.parentId ?? null,
    sensorId: asset.sensorId,
    sensorType: asset.sensorType,
    // Defini um valor padrão de "operating" para status caso o back-end não informe esse campo.
    status: asset.status ?? "operating",
    gatewayId: asset.gatewayId ?? null,
  };
};

/**
 * Cria o nó da árvore correspondente a uma localização, inicializando o array
 * de filhos para que novos nós possam ser anexados posteriormente.
 *
 * @param location - Localização recebida da API
 * @returns Nó da árvore representando a localização.
 */
const buildLocationNode = (location: Location): TreeNode => ({
  // Reaproveitamos o ID e nome da localização para identificação na árvore.
  id: location.id,
  name: location.name,
  type: "location",
  data: location,
  // Todo nó inicia com o array de filhos vazio.
  children: [],
});

/**
 * Cria um nó da árvore representando um equipamento.
 *
 * @param asset - Ativo já normalizado via `toNonComponentAsset`.
 * @returns Nó da árvore pronto para receber subativos ou componentes.
 */
const buildAssetNode = (asset: NonComponentAsset): TreeNode => ({
  id: asset.id,
  name: asset.name,
  type: "asset",
  data: asset,
  // Equipamentos podem receber componentes ou subativos posteriormente.
  children: [],
});

/**
 * Constrói o nó folha correspondente a um componente de sensor.
 *
 * @param asset - Componente normalizado via `toComponentAsset`.
 * @returns Nó folha contendo os metadados do componente.
 */
const buildComponentNode = (asset: ComponentAsset): TreeNode => ({
  id: asset.id,
  name: asset.name,
  type: "component",
  data: asset,
  // Componentes atuam como folhas, mas mantemos a estrutura por consistência.
  children: [],
});

/**
 * Anexa um nó ao pai adequado respeitando vínculos por `parentId` (entre
 * equipamentos/componentes) ou `locationId` (componentes ligados a
 * localizações). Quando nenhum relacionamento é encontrado, o nó se torna raiz.
 *
 * @param node - Nó a ser anexado.
 * @param locations - Mapa de localizações já materializadas como nós.
 * @param assets - Mapa com nós de ativos e componentes já construídos.
 * @param roots - Array mutável usado como coleção de raízes da árvore.
 */
const attachToParent = (
  node: TreeNode,
  locations: Map<string, TreeNode>,
  assets: Map<string, TreeNode>,
  roots: TreeNode[],
) => {
  // Sempre que o nó for um ativo/componente com `parentId`, tentamos localizá-lo
  // entre os equipamentos já processados.
  if (node.type !== "location" && node.data.parentId) {
    const parentAssetNode = assets.get(node.data.parentId);
    if (parentAssetNode && parentAssetNode.type === "asset") {
      // Encontrando o ativo pai, adicionamos o nó aos seus filhos
      parentAssetNode.children.push(node);
      return;
    }
  }

  // Caso o nó não tenha pai direto, verificamos se ele aponta para uma localização.
  if (node.type !== "location" && node.data.locationId) {
    const locationNode = locations.get(node.data.locationId);
    if (locationNode) {
      // Localização encontrada: anexamos o nó como filho dessa localização.
      locationNode.children.push(node);
      return;
    }
  }

  // se não achou pai então é no root
  roots.push(node);
};

// /**
//  * Ordena alfabeticamente cada nível da árvore (considerando collation
//  * brasileiro e ignorando acentuação) para melhorar previsibilidade na UI.
//  *
//  * @param nodes - Nós a serem ordenados.
//  * @returns Nova lista de nós ordenada com filhos recursivamente ordenados.
//  */
// const sortTree = (nodes: TreeNode[]): TreeNode[] => {
//   // Criamos uma cópia superficial para preservar a referência original.
//   const sorted = [...nodes].sort((a, b) =>
//     // A ordenação utiliza collation PT-BR e ignora acentos para consistência visual.
//     a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
//   );

//   return sorted.map((node) => ({
//     ...node,
//     // Aplicamos a mesma ordenação de forma recursiva para cada nível.
//     children: sortTree(node.children),
//   }));
// };

/**
 * Remove acentos e normaliza uma string para comparações case-insensitive.
 *
 * @param value - Texto original que será usado em buscas.
 * @returns Versão normalizada em minúsculas da string.
 */
const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Agrega os valores relevantes de um nó para a busca textual, incluindo o nome,
 * identificadores e metadados de sensores quando presentes.
 *
 * @param node - Nó da árvore em avaliação.
 * @returns Lista de strings que devem ser consideradas na busca.
 */
const collectSearchableValues = (node: TreeNode): string[] => {
  // Sempre incluímos nome e identificador do nó.
  const base = [node.name, node.id];

  if (node.type === "location") {
    // Localizações não possuem metadados adicionais relevantes para busca.
    return base;
  }

  const { parentId, locationId } = node.data;
  // Para ativos e componentes, incorporamos informações de hierarquia.
  const extended = [...base, parentId ?? "", locationId ?? ""];

  if (node.type === "component") {
    // Componentes trazem identificadores de sensor e gateway.
    extended.push(node.data.sensorId);
    if (node.data.gatewayId) {
      extended.push(node.data.gatewayId);
    }
  }

  return extended;
};

/**
 * Avalia se um nó satisfaz os filtros aplicados, combinando busca textual,
 * filtragem por sensores e estado crítico. Nós ancestrais podem ser incluídos
 * mesmo que não correspondam diretamente, desde que um descendente corresponda.
 *
 * @param node - Nó em avaliação.
 * @param filters - Conjunto atual de filtros aplicados pela interface.
 * @param normalizedTerm - Termo de busca já normalizado para comparação.
 * @returns `true` quando o nó cumpre todos os filtros ativos.
 */
const nodeMatchesFilters = (
  node: TreeNode,
  filters: AssetFilterState,
  normalizedTerm: string | null,
): boolean => {
  if (normalizedTerm) {
    // Avaliamos se algum dos valores pesquisáveis contém o termo informado.
    const matchesSearch = collectSearchableValues(node).some((value) =>
      normalize(value).includes(normalizedTerm),
    );

    if (!matchesSearch) {
      // Sem correspondência textual, podemos retornar logo.
      return false;
    }
  }

  if (filters.sensorTypes.length > 0) {
    if (node.type !== "component") {
      return false;
    }

    if (!filters.sensorTypes.includes(node.data.sensorType)) {
      return false;
    }
  }

  if (filters.criticalOnly) {
    if (node.type !== "component" || node.data.status !== "alert") {
      return false;
    }
  }

  return true;
};

/**
 * Replica a árvore original filtrando cada nível. O nó é mantido caso ele
 * próprio corresponda aos filtros ou se algum descendente permanecer após a
 * filtragem recursiva.
 *
 * @param node - Nó a ser processado.
 * @param filters - Filtros ativos.
 * @param normalizedTerm - Termo de busca já normalizado.
 * @returns Nó filtrado ou `null` quando deve ser excluído da árvore resultante.
 */
const filterNode = (
  node: TreeNode,
  filters: AssetFilterState,
  normalizedTerm: string | null,
): TreeNode | null => {
  const filteredChildren = node.children
    // Processamos cada filho recursivamente, obtendo nós possivelmente reduzidos.
    .map((child) => filterNode(child, filters, normalizedTerm))
    // Removemos entradas nulas originadas de nós que não passaram nos filtros.
    .filter((child) => child !== null);

  // Validamos se o próprio nó satisfaz os filtros.
  const selfMatches = nodeMatchesFilters(node, filters, normalizedTerm);
  // Nós ancestrais são mantidos quando ao menos um descendente foi aprovado.
  const shouldInclude = selfMatches || filteredChildren.length > 0;

  if (!shouldInclude) {
    return null;
  }

  return {
    ...node,
    // Atualizamos a lista de filhos com a versão filtrada.
    children: filteredChildren,
  };
};

/**
 * Aplica os filtros fornecidos à lista de nós raiz, retornando uma nova
 * referência somente quando algum filtro está ativo. O resultado mantém os
 * ancestrais necessários para preservar o caminho até nós correspondentes.
 *
 * @param nodes - os nodes da arvore já estruturada
 * @param filters - filtros atuais da UI
 * @returns a arore filtrada
 */
export const applyTreeFilters = (
  nodes: TreeNode[],
  filters: AssetFilterState,
): TreeNode[] => {
  const trimmedSearch = filters.searchTerm.trim();
  // Normalizamos o termo de busca apenas quando houver conteúdo relevante.
  const normalizedTerm = trimmedSearch ? normalize(trimmedSearch) : null;

  const hasSearch = Boolean(normalizedTerm);
  const hasSensorFilter = filters.sensorTypes.length > 0;
  const requiresCritical = filters.criticalOnly;

  if (!hasSearch && !hasSensorFilter && !requiresCritical) {
    // Sem filtros ativos retornamos a mesma referência para otimizar memoizações.
    return nodes;
  }

  return (
    nodes
      // Filtramos cada nó raiz individualmente.
      .map((node) => filterNode(node, filters, normalizedTerm))
      // Eliminamos resultados nulos retornados pela recursão.
      .filter((node): node is TreeNode => node !== null)
  );
};

/**
 * Constrói a árvore hierárquica contendo localizações, equipamentos e
 * componentes a partir dos arrays planos retornados pela API. A função cuida
 * da normalização de dados, criação de nós intermediários e ordenação final.
 *
 * @param locations - Listagem completa de localizações da empresa.
 * @param assets - Todos os ativos e componentes associados.
 * @returns Estrutura hierárquica pronta para ser renderizada na árvore.
 */
export const buildTree = (
  locations: Location[],
  assets: Asset[],
): TreeNode[] => {
  const locationNodes = new Map<string, TreeNode>();
  const assetNodes = new Map<string, TreeNode>();

  // minha arvore
  const roots: TreeNode[] = [];

  // aqui eu transformo os locations em nodes da arvore
  // mas ainda mantenho eles em um mapa só de localizações
  locations.forEach((location) => {
    const node = buildLocationNode(location);
    locationNodes.set(location.id, node);
  });

  // aqui eu relaciono as localizações entre si
  // respeitando o parentId quando presente
  // assim eu consigo montar a arvore de localizações primeiro
  locations.forEach((location) => {
    const node = locationNodes.get(location.id);
    if (!node) return;

    if (location.parentId) {
      const parentNode = locationNodes.get(location.parentId);
      if (parentNode) {
        // achei o pai no map e coloco como filho dele (mas ainda não está na arvore)
        parentNode.children.push(node);
        return;
      }
    }

    // os que não tem parentId ou que o parentId não foi encontrado são raízes então já posso colocar na minha arvore
    roots.push(node);
  });

  // aqui o loop só serve para transformar os assets em nodes e guardar no nosso map
  assets.forEach((asset) => {
    if (isComponent(asset)) {
      // faço a normalização e transformo em node
      const componentNode = buildComponentNode(toComponentAsset(asset));
      assetNodes.set(componentNode.id, componentNode);
      return;
    }

    // mesma coisa para os assets sem sensor
    const resolvedAssetNode = buildAssetNode(toNonComponentAsset(asset));
    assetNodes.set(resolvedAssetNode.id, resolvedAssetNode);
  });

  // ai sim aqui associamos o restante dos nodes entre si
  assets.forEach((asset) => {
    const node = assetNodes.get(asset.id);
    if (!node) return;
    // A função auxiliar cuida de conectar o nó em ativos ou localizações.
    attachToParent(node, locationNodes, assetNodes, roots);
  });

  // aqui poderia usar o sort, removi pra onerar menos a montagem da árvore
  return roots;
};
