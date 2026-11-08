import { useEffect, useState } from 'react';
import {
  Gamepad2,
  Maximize2,
  Minimize2,
  Table2,
  UserCheck,
} from 'lucide-react';
import type { Athletic } from '../../types';
import type { FifaAthlete } from '../../data/fifaData2026';
import {
  defaultFifaState,
  type FifaState,
} from '../../lib/fifaEngine';
import { FifaStandingsTable } from './FifaStandingsTable';
import { FifaBracketView } from './FifaBracketView';
import { FifaAthletesModal } from './FifaAthletesModal';

interface Props {
  athletics: Athletic[];
  notify: (text: string, kind?: 'ok' | 'err' | 'info') => void;
  readOnly?: boolean;
  onSyncWithOlympics?: (fifaState: FifaState) => void;
}

const FIFA_STORAGE_KEY = 'olimpiada-ufu-2026:fifa_v1';

export function FifaSystem({
  athletics,
  notify,
  readOnly = false,
  onSyncWithOlympics,
}: Props) {
  const [fifaState, setFifaState] = useState<FifaState>(() => {
    try {
      const raw = localStorage.getItem(FIFA_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.maleSlots)) {
          return {
            ...defaultFifaState(),
            ...parsed,
          };
        }
      }
    } catch {
      // ignore
    }
    return defaultFifaState();
  });

  const [activeFifaTab, setActiveFifaTab] = useState<'standings' | 'male' | 'female'>('standings');
  const [athletesModalOpen, setAthletesModalOpen] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);

  // Persistência local no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FIFA_STORAGE_KEY, JSON.stringify(fifaState));
    } catch {
      // ignore
    }
    if (onSyncWithOlympics) {
      onSyncWithOlympics(fifaState);
    }
  }, [fifaState, onSyncWithOlympics]);

  const updateState = (updates: Partial<FifaState>) => {
    setFifaState((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveAthletes = (updatedAthletes: FifaAthlete[]) => {
    updateState({ athletes: updatedAthletes });
  };

  return (
    <div
      className={`space-y-5 transition-all duration-300 ${
        isStandaloneMode
          ? 'fixed inset-0 z-50 overflow-y-auto bg-ink-950 p-3 sm:p-6'
          : ''
      }`}
    >
      {/* Banner de Topo do Sistema de E-Sports FIFA */}
      <div className="card relative overflow-hidden border-brand/50 bg-gradient-to-r from-brand/20 via-card to-card p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-brand/60 bg-gradient-to-br from-brand/30 via-brand/10 to-transparent shadow-[0_0_25px_-5px_rgba(249,115,22,0.8)]">
              <Gamepad2 size={24} className="text-brand sm:size-[26px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-xl font-extrabold tracking-wide text-white">
                  SISTEMA OFICIAL DE E-SPORTS · <span className="text-brand">FIFA 2026</span>
                </h2>
                <span className="rounded-full border border-brand/40 bg-brand/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-orange-400">
                  UFU 2026
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Chaveamentos com atualização de atletas em tempo real, repescagens oficiais e somatória total da pontuação por atlética.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAthletesModalOpen(true)}
              className="btn-ghost text-xs"
              title="Gerenciar e atualizar atletas cadastrados no FIFA"
            >
              <UserCheck size={14} className="text-brand" />
              <span>Gerenciar Atletas</span>
            </button>

            <button
              onClick={() => setIsStandaloneMode((prev) => !prev)}
              className="btn-ghost text-xs"
              title={
                isStandaloneMode
                  ? 'Voltar ao modo integrado do portal'
                  : 'Expandir para Modo Site Próprio / Tela Dedicada'
              }
            >
              {isStandaloneMode ? (
                <>
                  <Minimize2 size={14} />
                  <span>Modo Normal</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  <span>Modo Site Próprio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navegador de Abas Internas do FIFA */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line/60 pt-3">
          <button
            onClick={() => setActiveFifaTab('standings')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeFifaTab === 'standings'
                ? 'border border-brand/70 bg-gradient-to-r from-brand/30 to-brand/15 text-white shadow-[0_0_15px_-5px_rgba(249,115,22,0.6)]'
                : 'text-zinc-400 hover:bg-card-hi hover:text-zinc-200 border border-line bg-ink-900/40'
            }`}
          >
            <Table2 size={15} />
            <span>📊 Tabela Somatória (Masc + Fem)</span>
          </button>

          <button
            onClick={() => setActiveFifaTab('male')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeFifaTab === 'male'
                ? 'border border-sky-500/70 bg-gradient-to-r from-sky-500/30 to-sky-500/15 text-white shadow-[0_0_15px_-5px_rgba(14,165,233,0.6)]'
                : 'text-zinc-400 hover:bg-card-hi hover:text-zinc-200 border border-line bg-ink-900/40'
            }`}
          >
            <span>👦 Chave Masculina</span>
            <span className="rounded-full bg-ink-950 px-1.5 text-[10px] font-mono text-sky-400 font-bold">
              30 atletas
            </span>
          </button>

          <button
            onClick={() => setActiveFifaTab('female')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeFifaTab === 'female'
                ? 'border border-fuchsia-500/70 bg-gradient-to-r from-fuchsia-500/30 to-fuchsia-500/15 text-white shadow-[0_0_15px_-5px_rgba(217,70,239,0.6)]'
                : 'text-zinc-400 hover:bg-card-hi hover:text-zinc-200 border border-line bg-ink-900/40'
            }`}
          >
            <span>👧 Chave Feminina</span>
            <span className="rounded-full bg-ink-950 px-1.5 text-[10px] font-mono text-fuchsia-400 font-bold">
              29 atletas
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeFifaTab === 'standings' && (
        <FifaStandingsTable
          fifaState={fifaState}
          athletics={athletics}
          onAggregationChange={(mode) => updateState({ scoreAggregation: mode })}
          onNavigateToBracket={(gender) =>
            setActiveFifaTab(gender === 'M' ? 'male' : 'female')
          }
        />
      )}

      {activeFifaTab === 'male' && (
        <FifaBracketView
          gender="M"
          slots={fifaState.maleSlots}
          winners={fifaState.maleWinners}
          thirdWinner={fifaState.maleThirdWinner}
          consolationWinners={fifaState.maleConsolationWinners}
          fifthWinner={fifaState.maleFifthWinner}
          seventhWinner={fifaState.maleSeventhWinner}
          athletes={fifaState.athletes}
          athletics={athletics}
          onChange={(updates) =>
            updateState({
              maleWinners: updates.winners,
              maleThirdWinner: updates.thirdWinner,
              maleConsolationWinners: updates.consolationWinners,
              maleFifthWinner: updates.fifthWinner,
              maleSeventhWinner: updates.seventhWinner,
              ...(updates.slots ? { maleSlots: updates.slots } : {}),
            })
          }
          onOpenAthletesModal={() => setAthletesModalOpen(true)}
          notify={notify}
          readOnly={readOnly}
        />
      )}

      {activeFifaTab === 'female' && (
        <FifaBracketView
          gender="F"
          slots={fifaState.femaleSlots}
          winners={fifaState.femaleWinners}
          thirdWinner={fifaState.femaleThirdWinner}
          consolationWinners={fifaState.femaleConsolationWinners}
          fifthWinner={fifaState.femaleFifthWinner}
          seventhWinner={fifaState.femaleSeventhWinner}
          athletes={fifaState.athletes}
          athletics={athletics}
          onChange={(updates) =>
            updateState({
              femaleWinners: updates.winners,
              femaleThirdWinner: updates.thirdWinner,
              femaleConsolationWinners: updates.consolationWinners,
              femaleFifthWinner: updates.fifthWinner,
              femaleSeventhWinner: updates.seventhWinner,
              ...(updates.slots ? { femaleSlots: updates.slots } : {}),
            })
          }
          onOpenAthletesModal={() => setAthletesModalOpen(true)}
          notify={notify}
          readOnly={readOnly}
        />
      )}

      {/* Modal de Gestão de Atletas */}
      <FifaAthletesModal
        open={athletesModalOpen}
        onClose={() => setAthletesModalOpen(false)}
        athletes={fifaState.athletes}
        athletics={athletics}
        onSaveAthletes={handleSaveAthletes}
        notify={notify}
      />
    </div>
  );
}
