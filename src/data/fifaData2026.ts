// ============================================================================
// Chaveamento Oficial UFU 2026 - E-Sports FIFA (Masculino e Feminino)
// Dados extraídos dos chaveamentos oficiais do Congresso Técnico
// ============================================================================

export interface FifaAthlete {
  id: string;
  name: string;
  athleticId: string;
  gender: 'M' | 'F';
  isSeed?: boolean;
  seedOrder?: number;
}

// ----------------------------------------------------------------------------
// E-Sports Masculino - 30 Inscritos (2 cabeças de chave na repescagem JG16/15)
// ----------------------------------------------------------------------------
export const OFFICIAL_FIFA_MALE_ATHLETES: FifaAthlete[] = [
  // Cabeças de Chave (Destacados em Verde no sorteio oficial)
  { id: 'esm_medicina_1', name: 'Ronaldo Simões', athleticId: 'medicina', gender: 'M', isSeed: true, seedOrder: 1 },
  { id: 'esm_direito_1', name: 'Gustavo Brandão', athleticId: 'direito', gender: 'M', isSeed: true, seedOrder: 2 },
  { id: 'esm_engenharia_1', name: 'Pedro Simões', athleticId: 'engenharia', gender: 'M', isSeed: true, seedOrder: 3 },
  { id: 'esm_agrarias_1', name: 'Luís Gustavo', athleticId: 'agrarias', gender: 'M', isSeed: true, seedOrder: 4 },

  // Demais Atletas
  { id: 'esm_agrarias_2', name: 'Robert Néris', athleticId: 'agrarias', gender: 'M' },
  { id: 'esm_aplicada_1', name: 'Guilherme Davi', athleticId: 'aplicada', gender: 'M' },
  { id: 'esm_aplicada_2', name: 'Gustavo Felipe', athleticId: 'aplicada', gender: 'M' },
  { id: 'esm_artes_1', name: 'Artur Gonçalves', athleticId: 'artes', gender: 'M' },
  { id: 'esm_artes_2', name: 'Caio Monteiro', athleticId: 'artes', gender: 'M' },
  { id: 'esm_biologicas_1', name: 'José Henrique', athleticId: 'biologicas', gender: 'M' },
  { id: 'esm_biologicas_2', name: 'Matheus Luiz', athleticId: 'biologicas', gender: 'M' },
  { id: 'esm_computacao_1', name: 'Erick Antonio', athleticId: 'computacao', gender: 'M' },
  { id: 'esm_computacao_2', name: 'Nícolas Eduardo', athleticId: 'computacao', gender: 'M' },
  { id: 'esm_direito_2', name: 'Gabriel Dias', athleticId: 'direito', gender: 'M' },
  { id: 'esm_educa_1', name: 'João Alves', athleticId: 'educa', gender: 'M' },
  { id: 'esm_educa_2', name: 'Pedro Henrique', athleticId: 'educa', gender: 'M' },
  { id: 'esm_engenharia_2', name: 'Pedro Henrique', athleticId: 'engenharia', gender: 'M' },
  { id: 'esm_fisioterapia_1', name: 'Bruno Sousa', athleticId: 'fisioterapia', gender: 'M' },
  { id: 'esm_fisioterapia_2', name: 'Rafael Moraes', athleticId: 'fisioterapia', gender: 'M' },
  { id: 'esm_humanas_1', name: 'Leonardo Alfaiate', athleticId: 'humanas', gender: 'M' },
  { id: 'esm_humanas_2', name: 'Murilo Cardoso', athleticId: 'humanas', gender: 'M' },
  { id: 'esm_infernal_1', name: 'Pedro Henrique', athleticId: 'infernal', gender: 'M' },
  { id: 'esm_infernal_2', name: 'Guilherme Gorsso', athleticId: 'infernal', gender: 'M' },
  { id: 'esm_medicina_2', name: 'Lucas Barbosa', athleticId: 'medicina', gender: 'M' },
  { id: 'esm_moca_1', name: 'Felipe Alexandre', athleticId: 'moca', gender: 'M' },
  { id: 'esm_moca_2', name: 'Vinicius Leonardo', athleticId: 'moca', gender: 'M' },
  { id: 'esm_monetaria_1', name: 'Pedro Henry', athleticId: 'monetaria', gender: 'M' },
  { id: 'esm_monetaria_2', name: 'Tayssir Naim', athleticId: 'monetaria', gender: 'M' },
  { id: 'esm_psicologia_1', name: 'Guilherme Vilela', athleticId: 'psicologia', gender: 'M' },
  { id: 'esm_psicologia_2', name: 'João Gabriel', athleticId: 'psicologia', gender: 'M' },
];

// Slots oficiais da 1ª fase (32 posições) - Masculino
export const OFFICIAL_FIFA_MALE_SLOTS: (string | null)[] = [
  // JG1 (Match 0)
  'esm_medicina_1',    // Ronaldo Simões - AAA Medicina
  'esm_direito_2',     // Gabriel Dias - AAA Direito

  // JG9 (Match 1)
  'esm_engenharia_2',  // Pedro Henrique - AAA Engenharia
  'esm_infernal_1',    // Pedro Henrique - Infernal

  // JG5 (Match 2)
  'esm_aplicada_1',    // Guilherme Davi - AAA Aplicada
  'esm_monetaria_2',   // Tayssir Naim - AAA Monetária

  // JG13 (Match 3)
  'esm_computacao_2',  // Nicolas Eduardo - AAA Compexatas
  'esm_psicologia_2',  // João Gabriel - AAA Psicologia

  // JG8 (Match 4)
  'esm_fisioterapia_1',// Bruno Sousa - AAA Fisioterapia
  'esm_humanas_2',     // Murilo Cardoso - AAA Humanas

  // JG16 (Match 5)
  'esm_educa_1',       // João Alves - AAA Educa
  'LOSER:1',           // Perd JG1 (Perdedor Jogo 1)

  // JG4 (Match 6)
  'esm_agrarias_1',    // Luís Gustavo - AAA Agrárias
  'esm_artes_1',       // Artur Gonçalves - AAA Artes

  // JG12 (Match 7)
  'esm_biologicas_1',  // José Henrique - AAA Biológicas
  'esm_moca_1',        // Felipe Alexandre - AAA Moca

  // --- LADO DIREITO DA CHAVE ---

  // JG2 (Match 8)
  'esm_direito_1',     // Gustavo Brandão - AAA Direito
  'esm_agrarias_2',    // Robert Néris - AAA Agrárias

  // JG10 (Match 9)
  'esm_artes_2',       // Caio Monteiro - AAA Artes
  'esm_psicologia_1',  // Guilherme Vilela - AAA Psicologia

  // JG6 (Match 10)
  'esm_medicina_2',    // Lucas Barbosa - AAA Medicina
  'esm_monetaria_1',   // Pedro Henry - AAA Monetária

  // JG14 (Match 11)
  'esm_moca_2',        // Vinicius Leonardo - AAA Moca
  'esm_aplicada_2',    // Gustavo Felipe - AAA Aplicada

  // JG7 (Match 12)
  'esm_humanas_1',     // Leonardo Alfaiate - AAA Humanas
  'esm_biologicas_2',  // Matheus Luiz - AAA Biológicas

  // JG15 (Match 13)
  'esm_educa_2',       // Pedro Henrique - AAA Educa
  'LOSER:2',           // Perd JG2 (Perdedor Jogo 2)

  // JG3 (Match 14)
  'esm_engenharia_1',  // Pedro Simões - AAA Engenharia
  'esm_infernal_2',    // Guilherme Gorsso - AAA Infernal

  // JG11 (Match 15)
  'esm_fisioterapia_2',// Rafael Moraes - AAA Fisioterapia
  'esm_computacao_1',  // Erick Antonio - AAA Compexatas
];

// ----------------------------------------------------------------------------
// E-Sports Feminino - 29 Inscritas (3 cabeças de chave na repescagem JG16/15/6)
// ----------------------------------------------------------------------------
export const OFFICIAL_FIFA_FEMALE_ATHLETES: FifaAthlete[] = [
  // Cabeças de Chave (Destacadas em Verde no sorteio oficial)
  { id: 'esf_agrarias_1', name: 'Beatriz Rissatto', athleticId: 'agrarias', gender: 'F', isSeed: true, seedOrder: 1 },
  { id: 'esf_monetaria_1', name: 'Tamyres Azevedo', athleticId: 'monetaria', gender: 'F', isSeed: true, seedOrder: 2 },
  { id: 'esf_direito_1', name: 'Nicolle Schmaltz', athleticId: 'direito', gender: 'F', isSeed: true, seedOrder: 3 },

  // Demais Atletas
  { id: 'esf_agrarias_2', name: 'Thayla Dantas', athleticId: 'agrarias', gender: 'F' },
  { id: 'esf_aplicada_1', name: 'Maria Luiza', athleticId: 'aplicada', gender: 'F' },
  { id: 'esf_aplicada_2', name: 'Ana Flávia', athleticId: 'aplicada', gender: 'F' },
  { id: 'esf_artes_1', name: 'Ana Beatriz', athleticId: 'artes', gender: 'F' },
  { id: 'esf_artes_2', name: 'Beatriz Santana', athleticId: 'artes', gender: 'F' },
  { id: 'esf_biologicas_1', name: 'Lucymeire Souza', athleticId: 'biologicas', gender: 'F' },
  { id: 'esf_computacao_1', name: 'Amanda Leandro', athleticId: 'computacao', gender: 'F' },
  { id: 'esf_computacao_2', name: 'Fernanda Flor', athleticId: 'computacao', gender: 'F' },
  { id: 'esf_direito_2', name: 'Eduarda Sayd', athleticId: 'direito', gender: 'F' },
  { id: 'esf_educa_1', name: 'Isabela Santos', athleticId: 'educa', gender: 'F' },
  { id: 'esf_educa_2', name: 'Maria Eduarda', athleticId: 'educa', gender: 'F' },
  { id: 'esf_engenharia_1', name: 'Pamela Leonel', athleticId: 'engenharia', gender: 'F' },
  { id: 'esf_engenharia_2', name: 'Julia Barbosa', athleticId: 'engenharia', gender: 'F' },
  { id: 'esf_fisioterapia_1', name: 'Alícia Simões', athleticId: 'fisioterapia', gender: 'F' },
  { id: 'esf_fisioterapia_2', name: 'Maria Clara', athleticId: 'fisioterapia', gender: 'F' },
  { id: 'esf_humanas_1', name: 'Beatriz Lopes', athleticId: 'humanas', gender: 'F' },
  { id: 'esf_humanas_2', name: 'Nathalia Morais', athleticId: 'humanas', gender: 'F' },
  { id: 'esf_infernal_1', name: 'Ana Clara', athleticId: 'infernal', gender: 'F' },
  { id: 'esf_infernal_2', name: 'Laura Inês', athleticId: 'infernal', gender: 'F' },
  { id: 'esf_medicina_1', name: 'Ana Clara', athleticId: 'medicina', gender: 'F' },
  { id: 'esf_medicina_2', name: 'Julia Leal', athleticId: 'medicina', gender: 'F' },
  { id: 'esf_moca_1', name: 'Eduarda Tanaka', athleticId: 'moca', gender: 'F' },
  { id: 'esf_moca_2', name: 'Hanny Emilly', athleticId: 'moca', gender: 'F' },
  { id: 'esf_monetaria_2', name: 'Lorena Lelis', athleticId: 'monetaria', gender: 'F' },
  { id: 'esf_odonto_1', name: 'Camila Maria', athleticId: 'odonto', gender: 'F' },
  { id: 'esf_psicologia_1', name: 'Laura Castro', athleticId: 'psicologia', gender: 'F' },
];

// Slots oficiais da 1ª fase (32 posições) - Feminino
export const OFFICIAL_FIFA_FEMALE_SLOTS: (string | null)[] = [
  // JG1 (Match 0)
  'esf_agrarias_1',    // Beatriz Rissatto - AAA Agrárias
  'esf_monetaria_2',   // Lorena Lelis - AAA Monetária

  // JG9 (Match 1)
  'esf_computacao_1',  // Amanda Leandro - AAA Compexatas
  'esf_moca_2',        // Hanny Emilly - AAA Moca

  // JG5 (Match 2)
  'esf_biologicas_1',  // Lucymeire Souza - AAA Biológicas
  'esf_fisioterapia_1',// Alícia Simões - AAA Fisioterapia

  // JG13 (Match 3)
  'esf_engenharia_2',  // Julia Barbosa - AAA Engenharia
  'esf_odonto_1',      // Camila Maria - AAA Odonto

  // JG8 (Match 4)
  'esf_direito_2',     // Eduarda Sayd - AAA Direito
  'esf_medicina_2',    // Julia Leal - AAA Medicina

  // JG16 (Match 5)
  'esf_educa_2',       // Maria Eduarda - AAA Educa
  'LOSER:1',           // Perd 01 (Perdedora Jogo 1)

  // JG4 (Match 6)
  'esf_humanas_2',     // Nathalia Morais - AAA Humanas
  'esf_aplicada_1',    // Maria Luiza - AAA Aplicada

  // JG12 (Match 7)
  'esf_infernal_2',    // Laura Inês - AAA Infernal
  'esf_artes_2',       // Beatriz Santana - AAA Artes

  // --- LADO DIREITO DA CHAVE ---

  // JG2 (Match 8)
  'esf_monetaria_1',   // Tamyres Azevedo - AAA Monetária
  'esf_agrarias_2',    // Thayla Dantas - AAA Agrárias

  // JG10 (Match 9)
  'esf_educa_1',       // Isabela Santos - AAA Educa
  'esf_engenharia_1',  // Pamela Leonel - AAA Engenharia

  // JG6 (Match 10)
  'esf_psicologia_1',  // Laura Castro - AAA Psicologia
  'LOSER:3',           // Perd JG03 (Perdedora Jogo 3)

  // JG14 (Match 11)
  'esf_artes_1',       // Ana Beatriz - AAA Artes
  'esf_moca_1',        // Eduarda Tanaka - AAA Moca

  // JG7 (Match 12)
  'esf_medicina_1',    // Ana Clara - AAA Medicina
  'esf_infernal_1',    // Ana Clara - AAA Infernal

  // JG15 (Match 13)
  'esf_humanas_1',     // Beatriz Lopes - AAA Humanas
  'LOSER:2',           // Perd JG2 (Perdedora Jogo 2)

  // JG3 (Match 14)
  'esf_direito_1',     // Nicolle Schmaltz - AAA Direito
  'esf_aplicada_2',    // Ana Flávia - AAA Aplicada

  // JG11 (Match 15)
  'esf_computacao_2',  // Fernanda Flor - AAA Compexatas
  'esf_fisioterapia_2',// Maria Clara - AAA Fisioterapia
];

// Numeração dos jogos conforme os diagramas da UFU
export const FIFA_MATCH_NUMBERS = {
  round0: [1, 9, 5, 13, 8, 16, 4, 12, 2, 10, 6, 14, 7, 15, 3, 11],
  round1: [17, 21, 24, 20, 18, 22, 23, 19],
  round2: [25, 28, 26, 27],
  round3: [29, 30],
  final: 33,
  third: 34,
  consolationSemis: [31, 32],
  fifth: 35,
  seventh: 36,
} as const;
