import { useCallback, useEffect, useRef, useState } from 'react';
import type { FifaState } from '../lib/fifaEngine';
import { defaultFifaState } from '../lib/fifaEngine';
import {
  DEFAULT_FIFA_CLOUD_URL,
  encodeFifaForCloud,
  sanitizeFifaState,
} from '../lib/fifaStorage';

const FIFA_STORAGE_KEY = 'olimpiada_ufu_2026_fifa_standalone_v2';
const FIFA_CLOUD_URL_KEY = 'olimpiada_ufu_2026_fifa_cloud_url';
const FIFA_OPERATOR_KEY = 'olimpiada_ufu_2026_fifa_is_operator';

export function getFifaCloudUrl(): string {
  try {
    const saved = localStorage.getItem(FIFA_CLOUD_URL_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {
    // ignore
  }
  return DEFAULT_FIFA_CLOUD_URL;
}

export function setFifaCloudUrl(url: string) {
  try {
    const clean = url.trim();
    if (clean) localStorage.setItem(FIFA_CLOUD_URL_KEY, clean);
    else localStorage.removeItem(FIFA_CLOUD_URL_KEY);
  } catch {
    // ignore
  }
}

function hasContentDiff(a: FifaState, b: FifaState): boolean {
  return (
    JSON.stringify(a.maleWinners) !== JSON.stringify(b.maleWinners) ||
    JSON.stringify(a.femaleWinners) !== JSON.stringify(b.femaleWinners) ||
    JSON.stringify(a.maleSlots) !== JSON.stringify(b.maleSlots) ||
    JSON.stringify(a.femaleSlots) !== JSON.stringify(b.femaleSlots) ||
    a.maleThirdWinner !== b.maleThirdWinner ||
    a.femaleThirdWinner !== b.femaleThirdWinner ||
    JSON.stringify(a.maleConsolationWinners) !==
      JSON.stringify(b.maleConsolationWinners) ||
    JSON.stringify(a.femaleConsolationWinners) !==
      JSON.stringify(b.femaleConsolationWinners) ||
    a.maleFifthWinner !== b.maleFifthWinner ||
    a.maleSeventhWinner !== b.maleSeventhWinner ||
    a.femaleFifthWinner !== b.femaleFifthWinner ||
    a.femaleSeventhWinner !== b.femaleSeventhWinner ||
    a.scoreAggregation !== b.scoreAggregation
  );
}

export function useFifaCloudState() {
  const [fifaState, setFifaState] = useState<FifaState>(() => {
    try {
      const raw = localStorage.getItem(FIFA_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.maleSlots)) {
          return sanitizeFifaState(parsed);
        }
      }
    } catch {
      // ignore
    }
    return defaultFifaState();
  });

  const [isOperator, setIsOperatorState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(FIFA_OPERATOR_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [cloudUrl, setCloudUrlState] = useState<string>(getFifaCloudUrl);
  const [cloudStatus, setCloudStatus] = useState<
    'idle' | 'syncing' | 'synced' | 'error'
  >('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const stateRef = useRef(fifaState);
  stateRef.current = fifaState;

  const isOperatorRef = useRef(isOperator);
  isOperatorRef.current = isOperator;

  const cloudUrlRef = useRef(cloudUrl);
  cloudUrlRef.current = cloudUrl;

  const dirtySeqRef = useRef(0);
  const syncedSeqRef = useRef(0);
  const inFlightPushRef = useRef(false);

  // Salvar no localStorage local
  useEffect(() => {
    try {
      localStorage.setItem(FIFA_STORAGE_KEY, JSON.stringify(fifaState));
    } catch {
      // ignore
    }
  }, [fifaState]);

  const setIsOperator = useCallback((val: boolean) => {
    setIsOperatorState(val);
    try {
      localStorage.setItem(FIFA_OPERATOR_KEY, val ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, []);

  const updateCloudUrl = useCallback((newUrl: string) => {
    setFifaCloudUrl(newUrl);
    setCloudUrlState(newUrl);
  }, []);

  // Fila serializada de envio (PUT) para o Firebase
  const flushPush = useCallback(
    async (overrideUrl?: string): Promise<boolean> => {
      const targetUrl = overrideUrl ?? cloudUrlRef.current;
      if (!targetUrl) return false;
      if (inFlightPushRef.current) return true;

      inFlightPushRef.current = true;
      let allOk = true;

      try {
        while (dirtySeqRef.current > syncedSeqRef.current) {
          const seqToSync = dirtySeqRef.current;
          const snapshot = stateRef.current;
          setCloudStatus('syncing');

          const res = await fetch(targetUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(encodeFifaForCloud(snapshot)),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          syncedSeqRef.current = seqToSync;
          setCloudStatus('synced');
          setLastSyncTime(new Date());
        }
      } catch {
        setCloudStatus('error');
        allOk = false;
      } finally {
        inFlightPushRef.current = false;
      }

      return allOk;
    },
    [],
  );

  // Puxar do Firebase (pull)
  const pullFromCloud = useCallback(
    async (
      urlToUse = cloudUrlRef.current,
      forceAccept = false,
    ): Promise<boolean> => {
      if (!urlToUse) return false;

      // Se o Operador tem alterações locais pendentes de envio, envia primeiro
      if (
        !forceAccept &&
        isOperatorRef.current &&
        dirtySeqRef.current > syncedSeqRef.current
      ) {
        return flushPush(urlToUse);
      }

      const seqAtStart = dirtySeqRef.current;

      try {
        if (!inFlightPushRef.current) {
          setCloudStatus('syncing');
        }

        const res = await fetch(urlToUse, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Se o operador clicou durante o fetch, descarta o download antigo
        if (
          !forceAccept &&
          isOperatorRef.current &&
          (dirtySeqRef.current > syncedSeqRef.current ||
            dirtySeqRef.current !== seqAtStart ||
            inFlightPushRef.current)
        ) {
          return true;
        }

        if (data && typeof data === 'object') {
          const remoteState = sanitizeFifaState(data);
          setFifaState((prev) => {
            if (forceAccept) {
              stateRef.current = remoteState;
              syncedSeqRef.current = dirtySeqRef.current;
              return remoteState;
            }

            const remoteMs = Date.parse(remoteState.updatedAt || '') || 0;
            const localMs = Date.parse(prev.updatedAt || '') || 0;

            // Visitante/Espectador espelha sempre a nuvem oficial
            if (!isOperatorRef.current) {
              if (
                prev.updatedAt === remoteState.updatedAt &&
                !hasContentDiff(prev, remoteState)
              ) {
                return prev;
              }
              stateRef.current = remoteState;
              return remoteState;
            }

            // Operador aceita se nuvem for mais nova
            if (remoteMs > localMs) {
              stateRef.current = remoteState;
              return remoteState;
            }
            if (remoteMs === localMs && hasContentDiff(prev, remoteState)) {
              stateRef.current = remoteState;
              return remoteState;
            }

            return prev;
          });
        }

        if (dirtySeqRef.current === syncedSeqRef.current) {
          setCloudStatus('synced');
          setLastSyncTime(new Date());
        }
        return true;
      } catch {
        setCloudStatus('error');
        return false;
      }
    },
    [flushPush],
  );

  // Modificar estado local e enfileirar para nuvem (quando operador)
  const updateFifaState = useCallback(
    (updates: Partial<FifaState>) => {
      dirtySeqRef.current += 1;
      const nextTimestamp = new Date().toISOString();

      setFifaState((prev) => {
        const next: FifaState = {
          ...prev,
          ...updates,
          updatedAt: nextTimestamp,
        };
        stateRef.current = next;
        return next;
      });

      // Se for operador, envia na hora para a nuvem
      if (isOperatorRef.current) {
        flushPush();
      }
    },
    [flushPush],
  );

  // Inicialização e polling em segundo plano (a cada 2.5s para espectadores)
  useEffect(() => {
    pullFromCloud();

    const interval = setInterval(() => {
      // Polling ativo para espectadores receberem em tempo real
      if (!isOperatorRef.current || dirtySeqRef.current === syncedSeqRef.current) {
        pullFromCloud();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [pullFromCloud]);

  return {
    fifaState,
    updateFifaState,
    isOperator,
    setIsOperator,
    cloudUrl,
    updateCloudUrl,
    cloudStatus,
    lastSyncTime,
    pullFromCloud,
    flushPush,
  };
}
