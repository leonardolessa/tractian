# 🌳 Tractian Asset Tree

Aplicação do desafio Front End da Tactian para visualizar a hierarquia de locais, ativos e componentes com filtros em tempo real.

## Sumário

- [Visão geral](#visão-geral)
- [Demo & vídeo](#demo--vídeo)
- [Principais funcionalidades](#principais-funcionalidades)
- [Decisões de arquitetura](#decisões-de-arquitetura)
- [Observações especiais](#observações-especiais)
- [UI e experiência](#ui-e-experiência)
- [Testes e cobertura](#testes-e-cobertura)
- [Como rodar](#como-rodar)
- [Scripts úteis](#scripts-úteis)
- [Próximos passos](#próximos-passos)

## Visão geral

A aplicação consome a fake API pública do desafio e monta uma árvore navegável de empresas, localizações, ativos e componentes. O fluxo parte da escolha da empresa, segue para carregamento assíncrono de dados e termina com a renderização da árvore filtrada. O objetivo foi entregar uma experiência fluida, com feedback visual rápido e estrutura fácil de manter.

## Demo & vídeo

- **GitHub Pages**: `https://leonardolessa.github.io/tractian/`

![Demonstração em vídeo](video.gif)

[Assista ao vídeo completo](video.mp4)

## Principais funcionalidades

- Árvore dinâmica que mescla localizações, ativos, sub-ativos e componentes em um único fluxo.
- Filtros por texto, sensor de energia e status crítico sem perder o caminho completo dos nós pais.
- Estados de carregamento, vazio e erro dedicados para dar contexto ao usuário durante o fetch.
- UI customizada para o desafio

## Decisões de arquitetura

### RTK Query para dados remotos

- Centralizamos todo IO em um único `createApi`. Cada endpoint gera hooks declarativos, mantém caching normalizado e oferece `providesTags`/`invalidatesTags` para revalidar por nó.
- No cache moram apenas os dados “primitivos” vindos da API. Não guardamos a árvore montada dentro da store — isso evita duplicar estruturas e deixa o consumo de memória equivalente ao cache dos endpoints + o último resultado memoizado do selector.
- Caso ações mutassem um ativo (edição de status, por exemplo), bastaria utilizar alguma mutation com `invalidatesTags` para revalidar o nó afetado.

### Seletores memoizados para montar a árvore

- A árvore é construída por `createSelector` combinando os datasets de localizações e ativos. Enquanto as dependências não mudam, o selector devolve a mesma referência, reduzindo renders desnecessárias.
- As funções utilitárias em `helpers/tree.ts` cuidam da montagem de filhos e manutenção do caminho completo. O filtro final (`applyTreeFilters`) garante que mantemos todo o caminho visível mesmo quando um nó filho é o alvo do filtro.

### Organização da store

- O slice `treeSlice` guarda apenas estado de UI (empresa selecionada e filtros).
- Todo o estado restante fica de responsabilidade do RTK Query (dados, loading, erro).

## Observações especiais

- O projeto roda com o React Compiler habilitado, então deixamos de usar `useMemo`, `useCallback` e `memo` na maioria dos componentes porque as otimizações de referência já são automáticas. Em alguns pontos mantive o `useMemo` de propósito para sinalizar mentalmente que ali existia um gargalo importante caso estivéssemos sem o compilador.
- O arquivo do Figma fornecido pelo desafio não estava acessível quando desenvolvi a solução, então a interface apresentada aqui é uma proposta autoral pensada para equilibrar clareza, contraste e tempo de implementação.

## UI e experiência

- A UI foi pensada pra ter personalidade própria já que é um desafio. O layout é simples, mas bem específico e funcional.
- Pensando em algo escalável, os componentes deveriam ser mais genéricos e reutilizáveis, mas para o desafio priorizei entregar a experiência completa com mais rapidez.

## Testes e cobertura

Os testes unitários rodam com Vitest + Testing Library e cobrem desde os helpers até o comportamento dos componentes.

| Métrica    | Cobertura | Fração      |
| ---------- | --------- | ----------- |
| Statements | 96.96%    | 1279 / 1319 |
| Branches   | 83.55%    | 498 / 596   |
| Functions  | 83.33%    | 70 / 84     |
| Lines      | 96.96%    | 1279 / 1319 |

Use `npm run test:coverage` para gerar o relatório completo. O comando executa o Vitest com cobertura e produz os artefatos em `coverage/`, para consulta local ou integração com outras ferramentas. O fluxo de CI (`.github/workflows/tests.yml`) roda exatamente o mesmo script.

## Como rodar

1. Instale as dependências

   ```bash
   npm install
   ```

2. Configure variáveis de ambiente
   - Crie um arquivo `.env` na raiz do projeto.
   - Defina `VITE_API_BASE_URL` para apontar para a API

3. Rode em modo desenvolvimento (porta padrão `5173`)

   ```bash
   npm run dev
   ```

4. Build de produção

   ```bash
   npm run build
   npm run preview
   ```

## Scripts úteis

- `npm run lint` — valida linting com ESLint.
- `npm run test` — executa todos os testes uma vez.
- `npm run test:watch` — executa os testes em watch mode.
- `npm run test:coverage` — gera cobertura
- `npm run test:e2e` — suíte de smoke tests via Playwright.

## Possíveis melhorias (pensando em escalabilidade)

- **UI / Design System**: UI e componentes poderiam ser extraídos para uma biblioteca de componentes dedicada, suite de testes especifica, documentação e versionamento próprio.
- **Melhor estruturação de componentes**: principalmente o App ainda tem muito código e lógica misturados. Poderia ser dividido em mais componentes funcionais, hooks customizados, etc.
- **Expandir tudo / virtualização**: caso fosse necessário expandir muitos nós de uma vez, tentar abordagens variadas com virtualização, seja com a mesma estrutura de árvore ou mudando para uma lista flat, possivelmente teria que normalizar a altura dos itens, etc.
- **Acessibilidade**: ampliar suporte a teclado e leitor de tela na árvore (atributos ARIA específicos, foco gerenciado, etc).
- **Observabilidade**: adicionar logs de performance e tracing para medir o tempo de montagem da árvore e eventuais gargalos.
- **Testes**: Mais cenários de testes unitários e end-to-end ou até testes mais efetivos, pouco tempo dentro do negócio para entender todas as nuances.
