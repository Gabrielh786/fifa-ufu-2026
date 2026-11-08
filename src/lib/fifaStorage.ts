import type { FifaState } from './fifaEngine';
import { defaultFifaState } from './fifaEngine';
import {
  OFFICIAL_FIFA_MALE_SLOTS,
  OFFICIAL_FIFA_FEMALE_SLOTS,
  OFFICIAL_FIFA_MALE_ATHLETES,
  OFFICIAL_FIFA_FEMALE_ATHLETES,
} from '../data/fifaData2026';

export const DEFAULT_FIFA_CLOUD_URL =
  'https://olimpiadas-ufu-default-rtdb.firebaseio.com/fifa_live_2026.json';

export function encodeFifaForCloud(value: unknown): unknown {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(encodeFifaForCloud);
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = encodeFifaForCloud(v);
    }
    return out;
  }
  return value;
}

export function decodeFifaFromCloud(value: unknown): unknown {
  if (value === '') return null;
  if (Array.isArray(value)) return value.map(decodeFifaFromCloud);
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = decodeFifaFromCloud(v);
    }
    return out;
  }
  return value;
}

export function sanitizeFifaState(raw: unknown): FifaState {
  const d = defaultFifaState();
  if (!raw || typeof raw !== 'object') return d;
  const decoded = decodeFifaFromCloud(raw) as Partial<FifaState>;

  const sanitizeSlots = (arr: unknown, fallback: (string | null)[]) => {
    if (!Array.isArray(arr) || arr.length !== 32) return [...fallback];
    return arr.map((item) =>
      typeof item === 'string' && item.trim() ? item.trim() : null,
    );
  };

  const sanitizeWinners = (arr: unknown, expectedSizes: number[]) => {
    if (!Array.isArray(arr) || arr.length !== expectedSizes.length) {
      return expectedSizes.map((sz) => Array(sz).fill(null));
    }
    return arr.map((roundList, rIdx) => {
      const sz = expectedSizes[rIdx];
      if (!Array.isArray(roundList)) return Array(sz).fill(null);
      const res = Array(sz).fill(null);
      for (let i = 0; i < sz; i++) {
        const val = roundList[i];
        res[i] = typeof val === 'string' && val.trim() ? val.trim() : null;
      }
      return res;
    });
  };

  const sanitizeCons = (arr: unknown): (string | null)[] => {
    if (!Array.isArray(arr) || arr.length !== 2) return [null, null];
    return [
      typeof arr[0] === 'string' && arr[0].trim() ? arr[0].trim() : null,
      typeof arr[1] === 'string' && arr[1].trim() ? arr[1].trim() : null,
    ];
  };

  const sanitizeSingle = (val: unknown) => {
    return typeof val === 'string' && val.trim() ? val.trim() : null;
  };

  return {
    maleSlots: sanitizeSlots(decoded.maleSlots, OFFICIAL_FIFA_MALE_SLOTS),
    femaleSlots: sanitizeSlots(decoded.femaleSlots, OFFICIAL_FIFA_FEMALE_SLOTS),

    maleWinners: sanitizeWinners(decoded.maleWinners, [16, 8, 4, 2, 1]),
    maleThirdWinner: sanitizeSingle(decoded.maleThirdWinner),
    maleConsolationWinners: sanitizeCons(decoded.maleConsolationWinners),
    maleFifthWinner: sanitizeSingle(decoded.maleFifthWinner),
    maleSeventhWinner: sanitizeSingle(decoded.maleSeventhWinner),

    femaleWinners: sanitizeWinners(decoded.femaleWinners, [16, 8, 4, 2, 1]),
    femaleThirdWinner: sanitizeSingle(decoded.femaleThirdWinner),
    femaleConsolationWinners: sanitizeCons(decoded.femaleConsolationWinners),
    femaleFifthWinner: sanitizeSingle(decoded.femaleFifthWinner),
    femaleSeventhWinner: sanitizeSingle(decoded.femaleSeventhWinner),

    athletes:
      Array.isArray(decoded.athletes) && decoded.athletes.length > 0
        ? decoded.athletes
        : [...OFFICIAL_FIFA_MALE_ATHLETES, ...OFFICIAL_FIFA_FEMALE_ATHLETES],

    scoreAggregation: decoded.scoreAggregation === 'best' ? 'best' : 'sum',
    updatedAt:
      typeof decoded.updatedAt === 'string'
        ? decoded.updatedAt
        : new Date().toISOString(),
  };
}
