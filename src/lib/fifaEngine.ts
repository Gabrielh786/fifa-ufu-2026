// ============================================================================
// Motor de Torneio & Pontuação do E-Sports FIFA (UFU 2026)
// Suporta chaves de 32 jogadores com repescagem e consolação 5º ao 8º lugar
// ============================================================================
import type { Athletic } from '../types.ts';
import { POINTS } from '../data/modalities.ts';
import {
  FIFA_MATCH_NUMBERS,
  OFFICIAL_FIFA_MALE_ATHLETES,
  OFFICIAL_FIFA_FEMALE_ATHLETES,
  OFFICIAL_FIFA_MALE_SLOTS,
  OFFICIAL_FIFA_FEMALE_SLOTS,
  type FifaAthlete,
} from '../data/fifaData2026.ts';

export interface FifaMatch {
  matchNumber: number;
  round: number; // 0=16-avos, 1=oitavas, 2=quartas, 3=semis, 4=final, -1=3º, -2=semi consolação, -3=5º, -4=7º
  index: number;
  label: string;
  a: string | null; // ID do atleta ou null
  b: string | null;
  winner: string | null;
  loser: string | null;
  auto: boolean;
}

export interface ResolvedFifaBracket {
  rounds: FifaMatch[][];
  finalMatch: FifaMatch;
  thirdMatch: FifaMatch;
  consolationSemis: FifaMatch[];
  fifthMatch: FifaMatch;
  seventhMatch: FifaMatch;
  allMatches: FifaMatch[];
  definedPlaces: Record<string, number>; // athleteId -> lugar (1 a 8)
}

export interface AthleteScore {
  athlete: FifaAthlete;
  min: number;
  max: number;
  place?: number;
  label: string;
  isLocked: boolean;
  isEliminated: boolean;
  roundReached: string;
}

export interface AthleticFifaScore {
  athletic: Athletic;
  maleMin: number;
  maleMax: number;
  maleAvg: number;
  maleLocked: boolean;
  maleAthletes: AthleteScore[];

  femaleMin: number;
  femaleMax: number;
  femaleAvg: number;
  femaleLocked: boolean;
  femaleAthletes: AthleteScore[];

  totalMin: number;
  totalMax: number;
  totalAvg: number;
  totalLocked: boolean;

  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

export interface FifaState {
  maleSlots: (string | null)[];
  maleWinners: (string | null)[][]; // 5 rodadas (16, 8, 4, 2, 1)
  maleThirdWinner: string | null;
  maleConsolationWinners: (string | null)[]; // [semi 31, semi 32]
  maleFifthWinner: string | null;
  maleSeventhWinner: string | null;

  femaleSlots: (string | null)[];
  femaleWinners: (string | null)[][];
  femaleThirdWinner: string | null;
  femaleConsolationWinners: (string | null)[];
  femaleFifthWinner: string | null;
  femaleSeventhWinner: string | null;

  athletes: FifaAthlete[];
  scoreAggregation: 'sum' | 'best'; // padrão: 'sum'
  updatedAt: string;
}

export const isLoserMarker = (s: string | null | undefined): boolean =>
  typeof s === 'string' && s.startsWith('LOSER:');

export const getTargetLoserMatch = (s: string): number =>
  parseInt(s.replace('LOSER:', ''), 10);

export function defaultFifaState(): FifaState {
  const allAthletes = [
    ...OFFICIAL_FIFA_MALE_ATHLETES.map((a) => ({ ...a })),
    ...OFFICIAL_FIFA_FEMALE_ATHLETES.map((a) => ({ ...a })),
  ];

  return {
    maleSlots: [...OFFICIAL_FIFA_MALE_SLOTS],
    maleWinners: [
      Array(16).fill(null),
      Array(8).fill(null),
      Array(4).fill(null),
      Array(2).fill(null),
      Array(1).fill(null),
    ],
    maleThirdWinner: null,
    maleConsolationWinners: [null, null],
    maleFifthWinner: null,
    maleSeventhWinner: null,

    femaleSlots: [...OFFICIAL_FIFA_FEMALE_SLOTS],
    femaleWinners: [
      Array(16).fill(null),
      Array(8).fill(null),
      Array(4).fill(null),
      Array(2).fill(null),
      Array(1).fill(null),
    ],
    femaleThirdWinner: null,
    femaleConsolationWinners: [null, null],
    femaleFifthWinner: null,
    femaleSeventhWinner: null,

    athletes: allAthletes,
    scoreAggregation: 'sum',
    updatedAt: new Date().toISOString(),
  };
}

function makeMatch(
  matchNumber: number,
  round: number,
  index: number,
  label: string,
  a: string | null,
  b: string | null,
  storedWinner: string | null,
): FifaMatch {
  let winner: string | null = null;
  let loser: string | null = null;
  let auto = false;

  if (a && b) {
    if (storedWinner === a || storedWinner === b) {
      winner = storedWinner;
      loser = storedWinner === a ? b : a;
    }
  } else if (a && !b && round > 0) {
    // bye or awaiting
  }

  return {
    matchNumber,
    round,
    index,
    label,
    a,
    b,
    winner,
    loser,
    auto,
  };
}

// ----------------------------------------------------------------------------
// Resolução da Chave de 32 com Repescagem e Consolação 5º ao 8º
// ----------------------------------------------------------------------------
export function resolveFifaTournament(
  slots: (string | null)[],
  winners: (string | null)[][],
  thirdWinner: string | null,
  consolationWinners: (string | null)[],
  fifthWinner: string | null,
  seventhWinner: string | null,
): ResolvedFifaBracket {
  const round0Numbers = FIFA_MATCH_NUMBERS.round0;
  const round0Matches: FifaMatch[] = [];

  // Passagem 1 da Rodada 0: resolve confrontos onde ambos já estão definidos ou não são repescagem
  for (let i = 0; i < 16; i++) {
    const rawA = slots[2 * i] ?? null;
    const rawB = slots[2 * i + 1] ?? null;
    const mNum = round0Numbers[i];
    const a = isLoserMarker(rawA) ? null : rawA;
    const b = isLoserMarker(rawB) ? null : rawB;
    const stored = winners[0]?.[i] ?? null;

    round0Matches.push(
      makeMatch(mNum, 0, i, `Jogo ${mNum} · 16-avos`, a, b, stored),
    );
  }

  // Passagem 2 da Rodada 0: preenche slots de repescagem LOSER:X com perdedor do Jogo X
  const findMatchByNum = (num: number) =>
    round0Matches.find((m) => m.matchNumber === num);

  for (let i = 0; i < 16; i++) {
    const rawA = slots[2 * i] ?? null;
    const rawB = slots[2 * i + 1] ?? null;
    let effectiveA = round0Matches[i].a;
    let effectiveB = round0Matches[i].b;

    if (isLoserMarker(rawA)) {
      const targetNum = getTargetLoserMatch(rawA as string);
      const targetMatch = findMatchByNum(targetNum);
      effectiveA = targetMatch?.loser ?? null;
    }
    if (isLoserMarker(rawB)) {
      const targetNum = getTargetLoserMatch(rawB as string);
      const targetMatch = findMatchByNum(targetNum);
      effectiveB = targetMatch?.loser ?? null;
    }

    if (effectiveA !== round0Matches[i].a || effectiveB !== round0Matches[i].b) {
      const stored = winners[0]?.[i] ?? null;
      round0Matches[i] = makeMatch(
        round0Matches[i].matchNumber,
        0,
        i,
        round0Matches[i].label,
        effectiveA,
        effectiveB,
        stored,
      );
    }
  }

  // Rodada 1: Oitavas de Final (8 jogos)
  const round1Numbers = FIFA_MATCH_NUMBERS.round1;
  const round1Matches: FifaMatch[] = [];
  for (let i = 0; i < 8; i++) {
    const mNum = round1Numbers[i];
    const a = round0Matches[2 * i]?.winner ?? null;
    const b = round0Matches[2 * i + 1]?.winner ?? null;
    const stored = winners[1]?.[i] ?? null;
    round1Matches.push(
      makeMatch(mNum, 1, i, `Jogo ${mNum} · Oitavas`, a, b, stored),
    );
  }

  // Rodada 2: Quartas de Final (4 jogos)
  const round2Numbers = FIFA_MATCH_NUMBERS.round2;
  const round2Matches: FifaMatch[] = [];
  for (let i = 0; i < 4; i++) {
    const mNum = round2Numbers[i];
    const a = round1Matches[2 * i]?.winner ?? null;
    const b = round1Matches[2 * i + 1]?.winner ?? null;
    const stored = winners[2]?.[i] ?? null;
    round2Matches.push(
      makeMatch(mNum, 2, i, `Jogo ${mNum} · Quartas`, a, b, stored),
    );
  }

  // Rodada 3: Semifinais (2 jogos)
  const round3Numbers = FIFA_MATCH_NUMBERS.round3;
  const round3Matches: FifaMatch[] = [];
  for (let i = 0; i < 2; i++) {
    const mNum = round3Numbers[i];
    const a = round2Matches[2 * i]?.winner ?? null;
    const b = round2Matches[2 * i + 1]?.winner ?? null;
    const stored = winners[3]?.[i] ?? null;
    round3Matches.push(
      makeMatch(mNum, 3, i, `Jogo ${mNum} · Semifinal`, a, b, stored),
    );
  }

  // Rodada 4: Grande Final (Jogo 33)
  const finalNum = FIFA_MATCH_NUMBERS.final;
  const finalA = round3Matches[0]?.winner ?? null;
  const finalB = round3Matches[1]?.winner ?? null;
  const finalStored = winners[4]?.[0] ?? null;
  const finalMatch = makeMatch(
    finalNum,
    4,
    0,
    `Jogo ${finalNum} · Grande Final (1º e 2º Lugar)`,
    finalA,
    finalB,
    finalStored,
  );

  // Decisão de 3º Lugar (Jogo 34)
  const thirdNum = FIFA_MATCH_NUMBERS.third;
  const thirdA = round3Matches[0]?.loser ?? null;
  const thirdB = round3Matches[1]?.loser ?? null;
  const thirdMatch = makeMatch(
    thirdNum,
    -1,
    0,
    `Jogo ${thirdNum} · Decisão de 3º Lugar (3º e 4º)`,
    thirdA,
    thirdB,
    thirdWinner,
  );

  // Consolação 5º ao 8º Lugar
  // JG31: Perdedor JG25 (round2[0]) vs Perdedor JG28 (round2[1])
  const p25 = round2Matches[0]?.loser ?? null;
  const p28 = round2Matches[1]?.loser ?? null;
  const stored31 = consolationWinners?.[0] ?? null;
  const semi31 = makeMatch(
    FIFA_MATCH_NUMBERS.consolationSemis[0],
    -2,
    0,
    'Jogo 31 · Semi 5º ao 8º',
    p25,
    p28,
    stored31,
  );

  // JG32: Perdedor JG26 (round2[2]) vs Perdedor JG27 (round2[3])
  const p26 = round2Matches[2]?.loser ?? null;
  const p27 = round2Matches[3]?.loser ?? null;
  const stored32 = consolationWinners?.[1] ?? null;
  const semi32 = makeMatch(
    FIFA_MATCH_NUMBERS.consolationSemis[1],
    -2,
    1,
    'Jogo 32 · Semi 5º ao 8º',
    p26,
    p27,
    stored32,
  );

  // Final 5º e 6º Lugar (Jogo 35): Vencedor JG31 vs Vencedor JG32
  const p35A = semi31.winner ?? null;
  const p35B = semi32.winner ?? null;
  const fifthMatch = makeMatch(
    FIFA_MATCH_NUMBERS.fifth,
    -3,
    0,
    'Jogo 35 · Final 5º ao 6º Lugar',
    p35A,
    p35B,
    fifthWinner,
  );

  // Final 7º e 8º Lugar (Jogo 36): Perdedor JG31 vs Perdedor JG32
  const p36A = semi31.loser ?? null;
  const p36B = semi32.loser ?? null;
  const seventhMatch = makeMatch(
    FIFA_MATCH_NUMBERS.seventh,
    -4,
    0,
    'Jogo 36 · Final 7º ao 8º Lugar',
    p36A,
    p36B,
    seventhWinner,
  );

  const rounds = [
    round0Matches,
    round1Matches,
    round2Matches,
    round3Matches,
    [finalMatch],
  ];

  const allMatches: FifaMatch[] = [
    ...round0Matches,
    ...round1Matches,
    ...round2Matches,
    ...round3Matches,
    finalMatch,
    thirdMatch,
    semi31,
    semi32,
    fifthMatch,
    seventhMatch,
  ];

  // Mapeamento das colocações cravadas (1º ao 8º)
  const definedPlaces: Record<string, number> = {};
  if (finalMatch.winner) definedPlaces[finalMatch.winner] = 1;
  if (finalMatch.loser) definedPlaces[finalMatch.loser] = 2;
  if (thirdMatch.winner) definedPlaces[thirdMatch.winner] = 3;
  if (thirdMatch.loser) definedPlaces[thirdMatch.loser] = 4;
  if (fifthMatch.winner) definedPlaces[fifthMatch.winner] = 5;
  if (fifthMatch.loser) definedPlaces[fifthMatch.loser] = 6;
  if (seventhMatch.winner) definedPlaces[seventhMatch.winner] = 7;
  if (seventhMatch.loser) definedPlaces[seventhMatch.loser] = 8;

  return {
    rounds,
    finalMatch,
    thirdMatch,
    consolationSemis: [semi31, semi32],
    fifthMatch,
    seventhMatch,
    allMatches,
    definedPlaces,
  };
}

// ----------------------------------------------------------------------------
// Normalização e Limpeza em Cascata
// ----------------------------------------------------------------------------
export function sanitizeFifaBracket(
  slots: (string | null)[],
  winners: (string | null)[][],
  thirdWinner: string | null,
  consolationWinners: (string | null)[],
  fifthWinner: string | null,
  seventhWinner: string | null,
) {
  const cleanWinners = winners.map((r) => [...r]);
  let cleanThird = thirdWinner;
  const cleanConsolation = [...(consolationWinners ?? [null, null])];
  let cleanFifth = fifthWinner;
  let cleanSeventh = seventhWinner;

  // Passadas sucessivas em cascata para garantir que nenhuma dependência fique órfã
  for (let pass = 0; pass < 5; pass++) {
    const resolved = resolveFifaTournament(
      slots,
      cleanWinners,
      cleanThird,
      cleanConsolation,
      cleanFifth,
      cleanSeventh,
    );

    for (let r = 0; r < cleanWinners.length; r++) {
      for (let i = 0; i < cleanWinners[r].length; i++) {
        const w = cleanWinners[r][i];
        if (!w) continue;
        const m = resolved.rounds[r]?.[i];
        if (!m || (m.a !== w && m.b !== w)) {
          cleanWinners[r][i] = null;
        }
      }
    }

    if (
      cleanThird &&
      cleanThird !== resolved.thirdMatch.a &&
      cleanThird !== resolved.thirdMatch.b
    ) {
      cleanThird = null;
    }

    if (
      cleanConsolation[0] &&
      cleanConsolation[0] !== resolved.consolationSemis[0].a &&
      cleanConsolation[0] !== resolved.consolationSemis[0].b
    ) {
      cleanConsolation[0] = null;
    }
    if (
      cleanConsolation[1] &&
      cleanConsolation[1] !== resolved.consolationSemis[1].a &&
      cleanConsolation[1] !== resolved.consolationSemis[1].b
    ) {
      cleanConsolation[1] = null;
    }

    if (
      cleanFifth &&
      cleanFifth !== resolved.fifthMatch.a &&
      cleanFifth !== resolved.fifthMatch.b
    ) {
      cleanFifth = null;
    }

    if (
      cleanSeventh &&
      cleanSeventh !== resolved.seventhMatch.a &&
      cleanSeventh !== resolved.seventhMatch.b
    ) {
      cleanSeventh = null;
    }
  }

  return {
    winners: cleanWinners,
    thirdWinner: cleanThird,
    consolationWinners: cleanConsolation,
    fifthWinner: cleanFifth,
    seventhWinner: cleanSeventh,
  };
}

// ----------------------------------------------------------------------------
// Cálculo de Pontos por Atleta
// ----------------------------------------------------------------------------
export function computeAthleteScore(
  athlete: FifaAthlete,
  resolved: ResolvedFifaBracket,
): AthleteScore {
  const athleteId = athlete.id;

  // 1. Já tem lugar cravado de 1º a 8º?
  const place = resolved.definedPlaces[athleteId];
  if (place !== undefined && place >= 1 && place <= 8) {
    const pts = POINTS[place - 1];
    return {
      athlete,
      min: pts,
      max: pts,
      place,
      label: `${place}º Lugar Oficial (${pts} pts)`,
      isLocked: true,
      isEliminated: place > 1,
      roundReached: place <= 2 ? 'Final' : place <= 4 ? 'Semifinal' : 'Disputa 5º a 8º',
    };
  }

  // 2. Está na Grande Final aguardando resultado?
  if (
    resolved.finalMatch.a === athleteId ||
    resolved.finalMatch.b === athleteId
  ) {
    return {
      athlete,
      min: 10,
      max: 13,
      label: 'Na Grande Final (Garante Mín. 2º / 10 pts)',
      isLocked: false,
      isEliminated: false,
      roundReached: 'Final',
    };
  }

  // 3. Está na Decisão de 3º lugar aguardando resultado?
  if (
    resolved.thirdMatch.a === athleteId ||
    resolved.thirdMatch.b === athleteId
  ) {
    return {
      athlete,
      min: 7,
      max: 8,
      label: 'Na Decisão de 3º (Garante Mín. 4º / 7 pts)',
      isLocked: false,
      isEliminated: false,
      roundReached: 'Decisão de 3º',
    };
  }

  // 4. Está na Semifinal aguardando resultado?
  const inSemi = resolved.rounds[3].some(
    (m) => (m.a === athleteId || m.b === athleteId) && m.winner == null,
  );
  if (inSemi) {
    return {
      athlete,
      min: 7, // Perde semi e disputa de 3º -> 4º lugar
      max: 13, // Campeão
      label: 'Na Semifinal (Garante Mín. Top 4 / 7 pts)',
      isLocked: false,
      isEliminated: false,
      roundReached: 'Semifinal',
    };
  }

  // 5. Está na Final 5º ao 6º lugar aguardando resultado?
  if (
    (resolved.fifthMatch.a === athleteId ||
      resolved.fifthMatch.b === athleteId) &&
    resolved.fifthMatch.winner == null
  ) {
    return {
      athlete,
      min: 4,
      max: 5,
      label: 'Na Final de 5º/6º (Garante Mín. 6º / 4 pts)',
      isLocked: false,
      isEliminated: false,
      roundReached: 'Disputa 5º ao 8º',
    };
  }

  // 6. Está na Final 7º ao 8º lugar aguardando resultado?
  if (
    (resolved.seventhMatch.a === athleteId ||
      resolved.seventhMatch.b === athleteId) &&
    resolved.seventhMatch.winner == null
  ) {
    return {
      athlete,
      min: 2,
      max: 3,
      label: 'Na Final de 7º/8º (Garante Mín. 8º / 2 pts)',
      isLocked: false,
      isEliminated: false,
      roundReached: 'Disputa 5º ao 8º',
    };
  }

  // 7. Está na Semi Consolação 5º ao 8º (JG31 ou JG32) aguardando resultado?
  const inConsSemi = resolved.consolationSemis.some(
    (m) => (m.a === athleteId || m.b === athleteId) && m.winner == null,
  );
  if (inConsSemi) {
    return {
      athlete,
      min: 2,
      max: 5,
      label: 'Na Semi de 5º a 8º (Garante Mín. 8º / 2 pts)',
      isLocked: false,
      isEliminated: false,
      roundReached: 'Disputa 5º ao 8º',
    };
  }

  // 8. Está nas Quartas de Final aguardando resultado?
  const inQf = resolved.rounds[2].some(
    (m) => (m.a === athleteId || m.b === athleteId) && m.winner == null,
  );
  if (inQf) {
    return {
      athlete,
      min: 2, // Se perder quartas e consolação -> 8º lugar
      max: 13,
      label: 'Nas Quartas de Final (Garante Mín. Top 8 / 2 pts)',
      isLocked: false,
      isEliminated: false,
      roundReached: 'Quartas de Final',
    };
  }

  // 9. Está nas Oitavas de Final aguardando resultado?
  const inOitavas = resolved.rounds[1].some(
    (m) => (m.a === athleteId || m.b === athleteId) && m.winner == null,
  );
  if (inOitavas) {
    return {
      athlete,
      min: 0,
      max: 13,
      label: 'Nas Oitavas de Final · Aberto',
      isLocked: false,
      isEliminated: false,
      roundReached: 'Oitavas de Final',
    };
  }

  // 10. Está nos 16-avos aguardando resultado?
  const in16avos = resolved.rounds[0].some(
    (m) => (m.a === athleteId || m.b === athleteId) && m.winner == null,
  );
  if (in16avos) {
    return {
      athlete,
      min: 0,
      max: 13,
      label: '16-avos de Final · A disputar',
      isLocked: false,
      isEliminated: false,
      roundReached: '16-avos de Final',
    };
  }

  // 11. Se perdeu em rodadas anteriores e não está em nenhuma disputa ativa
  const reachedOitavas = resolved.rounds[1].some(
    (m) => m.a === athleteId || m.b === athleteId,
  );
  return {
    athlete,
    min: 0,
    max: 0,
    label: reachedOitavas
      ? 'Eliminado(a) nas Oitavas (0 pts)'
      : 'Eliminado(a) nos 16-avos (0 pts)',
    isLocked: true,
    isEliminated: true,
    roundReached: reachedOitavas ? 'Oitavas de Final' : '16-avos de Final',
  };
}

// ----------------------------------------------------------------------------
// Consolidação Geral por Atlética (Masculino + Feminino)
// ----------------------------------------------------------------------------
export function computeAthleticsFifaScores(
  athletics: Athletic[],
  fifaState: FifaState,
): AthleticFifaScore[] {
  const maleResolved = resolveFifaTournament(
    fifaState.maleSlots,
    fifaState.maleWinners,
    fifaState.maleThirdWinner,
    fifaState.maleConsolationWinners,
    fifaState.maleFifthWinner,
    fifaState.maleSeventhWinner,
  );

  const femaleResolved = resolveFifaTournament(
    fifaState.femaleSlots,
    fifaState.femaleWinners,
    fifaState.femaleThirdWinner,
    fifaState.femaleConsolationWinners,
    fifaState.femaleFifthWinner,
    fifaState.femaleSeventhWinner,
  );

  const athletesByAthleticAndGender = (athId: string, g: 'M' | 'F') =>
    fifaState.athletes.filter((a) => a.athleticId === athId && a.gender === g);

  const results: AthleticFifaScore[] = athletics.map((ath) => {
    // Atletas masculinos
    const maleAthletes = athletesByAthleticAndGender(ath.id, 'M').map((a) =>
      computeAthleteScore(a, maleResolved),
    );

    // Atletas femininas
    const femaleAthletes = athletesByAthleticAndGender(ath.id, 'F').map((a) =>
      computeAthleteScore(a, femaleResolved),
    );

    let maleMin = 0;
    let maleMax = 0;
    let femaleMin = 0;
    let femaleMax = 0;

    if (fifaState.scoreAggregation === 'best') {
      if (maleAthletes.length > 0) {
        maleMin = Math.max(...maleAthletes.map((a) => a.min));
        maleMax = Math.max(...maleAthletes.map((a) => a.max));
      }
      if (femaleAthletes.length > 0) {
        femaleMin = Math.max(...femaleAthletes.map((a) => a.min));
        femaleMax = Math.max(...femaleAthletes.map((a) => a.max));
      }
    } else {
      // Soma direta dos pontos de todos os atletas
      maleAthletes.forEach((a) => {
        maleMin += a.min;
        maleMax += a.max;
      });
      femaleAthletes.forEach((a) => {
        femaleMin += a.min;
        femaleMax += a.max;
      });
    }

    const maleLocked = maleMin === maleMax && maleAthletes.every((a) => a.isLocked);
    const femaleLocked = femaleMin === femaleMax && femaleAthletes.every((a) => a.isLocked);

    const totalMin = maleMin + femaleMin;
    const totalMax = maleMax + femaleMax;
    const totalAvg = (totalMin + totalMax) / 2;
    const totalLocked = maleLocked && femaleLocked;

    // Contagem de medalhas
    let goldCount = 0;
    let silverCount = 0;
    let bronzeCount = 0;

    [...maleAthletes, ...femaleAthletes].forEach((a) => {
      if (a.place === 1) goldCount++;
      if (a.place === 2) silverCount++;
      if (a.place === 3) bronzeCount++;
    });

    return {
      athletic: ath,
      maleMin,
      maleMax,
      maleAvg: (maleMin + maleMax) / 2,
      maleLocked,
      maleAthletes,

      femaleMin,
      femaleMax,
      femaleAvg: (femaleMin + femaleMax) / 2,
      femaleLocked,
      femaleAthletes,

      totalMin,
      totalMax,
      totalAvg,
      totalLocked,

      goldCount,
      silverCount,
      bronzeCount,
    };
  });

  return results;
}

export function sortFifaStandings(
  scores: AthleticFifaScore[],
  metric: 'total' | 'male' | 'female' = 'total',
): AthleticFifaScore[] {
  return [...scores].sort((x, y) => {
    let diff = 0;
    if (metric === 'male') {
      diff = y.maleAvg - x.maleAvg;
      if (diff === 0) diff = y.maleMax - x.maleMax;
      if (diff === 0) diff = y.maleMin - x.maleMin;
    } else if (metric === 'female') {
      diff = y.femaleAvg - x.femaleAvg;
      if (diff === 0) diff = y.femaleMax - x.femaleMax;
      if (diff === 0) diff = y.femaleMin - x.femaleMin;
    } else {
      diff = y.totalAvg - x.totalAvg;
      if (diff === 0) diff = y.totalMax - x.totalMax;
      if (diff === 0) diff = y.totalMin - x.totalMin;
    }

    if (diff !== 0) return diff;

    // Critério de desempate: Medalhas de Ouro, Prata, Bronze
    if (y.goldCount !== x.goldCount) return y.goldCount - x.goldCount;
    if (y.silverCount !== x.silverCount) return y.silverCount - x.silverCount;
    if (y.bronzeCount !== x.bronzeCount) return y.bronzeCount - x.bronzeCount;

    return x.athletic.name.localeCompare(y.athletic.name, 'pt-BR');
  });
}

// ----------------------------------------------------------------------------
// Simulação Completa 100% de uma Chave (Multi-pass garantindo repescagens e finais)
// ----------------------------------------------------------------------------
export function simulateFifaBracket(slots: (string | null)[]) {
  const currWinners: (string | null)[][] = [
    Array(16).fill(null),
    Array(8).fill(null),
    Array(4).fill(null),
    Array(2).fill(null),
    Array(1).fill(null),
  ];
  let currThird: string | null = null;
  const currCons: (string | null)[] = [null, null];
  let currFifth: string | null = null;
  let currSeventh: string | null = null;

  for (let loop = 0; loop < 10; loop++) {
    let changed = false;
    const res = resolveFifaTournament(
      slots,
      currWinners,
      currThird,
      currCons,
      currFifth,
      currSeventh,
    );

    // Rodadas 0 a 4 (16-avos, Oitavas, Quartas, Semis, Final)
    for (let r = 0; r < 5; r++) {
      res.rounds[r].forEach((m, idx) => {
        if (m.a && m.b && !currWinners[r][idx]) {
          currWinners[r][idx] = Math.random() > 0.5 ? m.a : m.b;
          changed = true;
        }
      });
    }

    // Decisão de 3º Lugar (Jogo 34)
    if (res.thirdMatch.a && res.thirdMatch.b && !currThird) {
      currThird = Math.random() > 0.5 ? res.thirdMatch.a : res.thirdMatch.b;
      changed = true;
    }

    // Semis de Consolação 5º ao 8º (Jogos 31 e 32)
    res.consolationSemis.forEach((m, idx) => {
      if (m.a && m.b && !currCons[idx]) {
        currCons[idx] = Math.random() > 0.5 ? m.a : m.b;
        changed = true;
      }
    });

    // Final 5º/6º (Jogo 35)
    if (res.fifthMatch.a && res.fifthMatch.b && !currFifth) {
      currFifth = Math.random() > 0.5 ? res.fifthMatch.a : res.fifthMatch.b;
      changed = true;
    }

    // Final 7º/8º (Jogo 36)
    if (res.seventhMatch.a && res.seventhMatch.b && !currSeventh) {
      currSeventh =
        Math.random() > 0.5 ? res.seventhMatch.a : res.seventhMatch.b;
      changed = true;
    }

    if (!changed) break;
  }

  return {
    winners: currWinners,
    thirdWinner: currThird,
    consolationWinners: currCons,
    fifthWinner: currFifth,
    seventhWinner: currSeventh,
  };
}
