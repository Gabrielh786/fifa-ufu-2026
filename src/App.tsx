import { useState } from 'react';
import {
  Gamepad2,
  Moon,
  Radio,
  RotateCcw,
  Sun,
  Table2,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { DEFAULT_ATHLETICS } from './data/athletics';
import type { Athletic } from './types';
import type { FifaAthlete } from './data/fifaData2026';
import {
  resolveFifaTournament,
  computeAthleticsFifaScores,
  simulateFifaBracket,
} from './lib/fifaEngine';
import { FifaStandingsTable } from './components/fifa/FifaStandingsTable';
import { FifaBracketView } from './components/fifa/FifaBracketView';
import { FifaAthletesModal } from './components/fifa/FifaAthletesModal';
import { FifaCloudModal } from './components/fifa/FifaCloudModal';
import { useFifaCloudState } from './hooks/useFifaCloudState';
import { Toasts, type ToastMsg } from './components/ui';
import { useTheme } from './hooks/useTheme';

export function App() {
  const { isDark, toggleTheme } = useTheme();

  // Estado Reativo com Sincronização em Nuvem (Firebase Realtime Database)
  const {
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
  } = useFifaCloudState();

  const [activeTab, setActiveTab] = useState<'standings' | 'male' | 'female'>('standings');
  const [athletesModalOpen, setAthletesModalOpen] = useState(false);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const athletics: Athletic[] = DEFAULT_ATHLETICS;

  const notify = (text: string, kind: 'ok' | 'err' | 'info' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const updateState = updateFifaState;

  const handleSaveAthletes = (updatedAthletes: FifaAthlete[]) => {
    updateState({ athletes: updatedAthletes });
  };

  // Cálculos consolidados em tempo real
  const maleRes = resolveFifaTournament(
    fifaState.maleSlots,
    fifaState.maleWinners,
    fifaState.maleThirdWinner,
    fifaState.maleConsolationWinners,
    fifaState.maleFifthWinner,
    fifaState.maleSeventhWinner,
  );

  const femaleRes = resolveFifaTournament(
    fifaState.femaleSlots,
    fifaState.femaleWinners,
    fifaState.femaleThirdWinner,
    fifaState.femaleConsolationWinners,
    fifaState.femaleFifthWinner,
    fifaState.femaleSeventhWinner,
  );

  const maleDefined = maleRes.allMatches.filter((m) => m.winner != null).length;
  const femaleDefined = femaleRes.allMatches.filter((m) => m.winner != null).length;
  const totalDefined = maleDefined + femaleDefined;
  const totalMatches = maleRes.allMatches.length + femaleRes.allMatches.length;

  // Pontuação somada
  const scores = computeAthleticsFifaScores(athletics, fifaState);
  const top1 = [...scores].sort((a, b) => b.totalAvg - a.totalAvg)[0];

  const handleSimulateAll = () => {
    if (
      !confirm(
        'Simular 100% dos resultados aleatórios para AMBAS as chaves (Masculino e Feminino) até as Grandes Finais?',
      )
    )
      return;

    const maleSim = simulateFifaBracket(fifaState.maleSlots);
    const femaleSim = simulateFifaBracket(fifaState.femaleSlots);

    updateFifaState({
      maleWinners: maleSim.winners,
      maleThirdWinner: maleSim.thirdWinner,
      maleConsolationWinners: maleSim.consolationWinners,
      maleFifthWinner: maleSim.fifthWinner,
      maleSeventhWinner: maleSim.seventhWinner,

      femaleWinners: femaleSim.winners,
      femaleThirdWinner: femaleSim.thirdWinner,
      femaleConsolationWinners: femaleSim.consolationWinners,
      femaleFifthWinner: femaleSim.fifthWinner,
      femaleSeventhWinner: femaleSim.seventhWinner,
    });
    notify('🎲 Torneio FIFA 100% simulado para Masculino e Feminino!', 'ok');
  };

  const handleResetAll = () => {
    if (
      !confirm(
        'Deseja zerar todos os resultados do torneio FIFA (Masculino e Feminino)? Os atletas e o sorteio oficial serão mantidos.',
      )
    )
      return;

    updateFifaState({
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
    });
    notify('Resultados zerados. Chave pronta para novas partidas!', 'info');
  };

  return (
    <div className="min-h-screen pb-16 bg-ink-950 text-zinc-100 transition-colors duration-200">
      {/* Barra de Topo */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
          {/* Logo & Título */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand/60 bg-gradient-to-br from-brand/30 via-brand/10 to-transparent shadow-[0_0_20px_-5px_rgba(249,115,22,0.8)]">
              <Gamepad2 size={24} className="text-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-sm sm:text-base font-extrabold tracking-wider text-white">
                  E-SPORTS FIFA · <span className="text-brand">UFU 2026</span>
                </h1>
                <span className="rounded-full border border-brand/40 bg-brand/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-orange-400">
                  Masc + Fem
                </span>
              </div>
              <p className="hidden text-[11px] text-zinc-400 sm:block">
                Somatória de pontos em tempo real das Atléticas nos torneios Masculino e Feminino
              </p>
            </div>
          </div>

          {/* Ações da Barra */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status e Controle da Nuvem / Ao Vivo */}
            <button
              onClick={() => setCloudModalOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                isOperator
                  ? 'border-emerald-500/70 bg-gradient-to-r from-emerald-500/25 to-emerald-500/10 text-emerald-300 hover:border-emerald-400'
                  : 'border-sky-500/50 bg-gradient-to-r from-sky-500/20 to-sky-500/10 text-sky-300 hover:border-sky-400'
              }`}
              title="Configurar banco na nuvem e alternar entre Operador (atualizar ao vivo) e Espectador"
            >
              <Radio
                size={13}
                className={
                  cloudStatus === 'synced'
                    ? 'text-emerald-400 animate-pulse'
                    : cloudStatus === 'syncing'
                      ? 'text-amber-400 animate-spin'
                      : 'text-rose-400'
                }
              />
              <span className="font-extrabold uppercase tracking-wide">
                {isOperator ? 'Modo Operador' : 'Ao Vivo'}
              </span>
              <span className="hidden sm:inline rounded bg-ink-950/70 px-1.5 py-0.2 text-[9px] font-mono text-zinc-300">
                {cloudStatus === 'synced' ? 'Nuvem Conectada' : 'Sync...'}
              </span>
            </button>

            <button
              onClick={() => setAthletesModalOpen(true)}
              className="btn-ghost text-xs"
              title="Gerenciar e atualizar atletas cadastrados no torneio"
            >
              <UserCheck size={14} className="text-brand" />
              <span className="hidden sm:inline">Atualizar Atletas</span>
            </button>

            <button
              onClick={handleResetAll}
              className="btn-ghost text-xs text-red-400 hover:text-red-300"
              title="Zerar todos os resultados dos confrontos"
            >
              <RotateCcw size={13} />
              <span className="hidden md:inline">Zerar</span>
            </button>

            {/* Alternar Tema */}
            <button
              onClick={toggleTheme}
              className="btn-ghost px-2.5 py-1.5"
              title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* Barra de Navegação das Abas & Status */}
        <div className="border-t border-line/70 bg-ink-900/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-6">
            {/* Navegador das 3 Abas Principais */}
            <nav className="flex w-full items-center gap-1 sm:w-auto sm:gap-2">
              <button
                onClick={() => setActiveTab('standings')}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition sm:text-sm ${
                  activeTab === 'standings'
                    ? 'border border-brand/70 bg-gradient-to-r from-brand/30 to-brand/15 text-white shadow-[0_0_20px_-8px_rgba(249,115,22,0.8)]'
                    : 'text-zinc-400 hover:bg-card-hi hover:text-zinc-200'
                }`}
              >
                <Table2 size={15} />
                <span>📊 Tabela Somatória das Atléticas</span>
              </button>

              <button
                onClick={() => setActiveTab('male')}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition sm:text-sm ${
                  activeTab === 'male'
                    ? 'border border-sky-500/70 bg-gradient-to-r from-sky-500/30 to-sky-500/15 text-white shadow-[0_0_20px_-8px_rgba(14,165,233,0.8)]'
                    : 'text-zinc-400 hover:bg-card-hi hover:text-zinc-200'
                }`}
              >
                <span>👦 Chave Masculina</span>
                <span className="rounded-full bg-ink-950 px-1.5 py-0.2 text-[10px] font-mono text-sky-400 font-bold">
                  30 atletas
                </span>
              </button>

              <button
                onClick={() => setActiveTab('female')}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition sm:text-sm ${
                  activeTab === 'female'
                    ? 'border border-fuchsia-500/70 bg-gradient-to-r from-fuchsia-500/30 to-fuchsia-500/15 text-white shadow-[0_0_20px_-8px_rgba(217,70,239,0.8)]'
                    : 'text-zinc-400 hover:bg-card-hi hover:text-zinc-200'
                }`}
              >
                <span>👧 Chave Feminina</span>
                <span className="rounded-full bg-ink-950 px-1.5 py-0.2 text-[10px] font-mono text-fuchsia-400 font-bold">
                  29 atletas
                </span>
              </button>
            </nav>

            {/* Contador Dinâmico */}
            <div className="flex w-full items-center justify-between gap-3 text-xs sm:w-auto">
              <div className="flex items-center gap-2 rounded-full border border-bronze-hi/60 bg-ink-950 px-3 py-1 text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                <span>
                  <strong className="font-mono text-orange-400">{totalDefined}</strong> de {totalMatches} jogos definidos
                </span>
              </div>

              {top1 && (
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-300">
                  <Trophy size={13} className="text-gold" />
                  <span>
                    Líder:{' '}
                    <strong className="text-amber-300">{top1.athletic.name}</strong>{' '}
                    ({top1.totalMin === top1.totalMax ? `${top1.totalMin} pts` : `${top1.totalMin}~${top1.totalMax} pts`})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-7xl px-3 pt-5 sm:px-6">
        {activeTab === 'standings' && (
          <FifaStandingsTable
            fifaState={fifaState}
            athletics={athletics}
            onAggregationChange={(mode) => updateState({ scoreAggregation: mode })}
            onNavigateToBracket={(gender) =>
              setActiveTab(gender === 'M' ? 'male' : 'female')
            }
            onSimulateAll={handleSimulateAll}
            onResetAll={handleResetAll}
          />
        )}

        {activeTab === 'male' && (
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
            readOnly={!isOperator}
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
          />
        )}

        {activeTab === 'female' && (
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
            readOnly={!isOperator}
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
          />
        )}
      </main>

      {/* Modal de Sincronização em Nuvem (Firebase) */}
      <FifaCloudModal
        open={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
        cloudUrl={cloudUrl}
        onSaveUrl={updateCloudUrl}
        cloudStatus={cloudStatus}
        lastSyncTime={lastSyncTime}
        isOperator={isOperator}
        onToggleOperator={setIsOperator}
        onForcePull={pullFromCloud}
        onForcePush={flushPush}
        notify={notify}
      />

      {/* Modal de Gestão de Atletas */}
      <FifaAthletesModal
        open={athletesModalOpen}
        onClose={() => setAthletesModalOpen(false)}
        athletes={fifaState.athletes}
        athletics={athletics}
        onSaveAthletes={handleSaveAthletes}
        notify={notify}
      />

      {/* Toasts de Notificação */}
      <Toasts items={toasts} />
    </div>
  );
}

export default App;
