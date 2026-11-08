import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Dices,
  Download,
  Eraser,
  Medal,
  Printer,
  Search,
  Trophy,
} from 'lucide-react';
import type { Athletic } from '../../types';
import type { FifaState } from '../../lib/fifaEngine';
import {
  computeAthleticsFifaScores,
  sortFifaStandings,
} from '../../lib/fifaEngine';
import { AthleticBadge, displayName } from '../ui';

interface Props {
  fifaState: FifaState;
  athletics: Athletic[];
  onAggregationChange: (mode: 'sum' | 'best') => void;
  onNavigateToBracket?: (gender: 'M' | 'F') => void;
  onSimulateAll?: () => void;
  onResetAll?: () => void;
}

export function FifaStandingsTable({
  fifaState,
  athletics,
  onAggregationChange,
  onNavigateToBracket,
  onSimulateAll,
  onResetAll,
}: Props) {
  const [metric, setMetric] = useState<'total' | 'male' | 'female'>('total');
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const scores = useMemo(
    () => computeAthleticsFifaScores(athletics, fifaState),
    [athletics, fifaState],
  );

  const sorted = useMemo(
    () => sortFifaStandings(scores, metric),
    [scores, metric],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase().trim();
    return sorted.filter(
      (s) =>
        s.athletic.name.toLowerCase().includes(q) ||
        s.athletic.short.toLowerCase().includes(q),
    );
  }, [sorted, search]);

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Estatísticas do Topo
  const top1Total = sorted[0];
  const top1Male = [...scores].sort((a, b) => b.maleAvg - a.maleAvg)[0];
  const top1Female = [...scores].sort((a, b) => b.femaleAvg - a.femaleAvg)[0];

  // Exportar CSV
  const handleExportCSV = () => {
    const headers = [
      'Posição',
      'Atlética',
      'Masc_Min',
      'Masc_Max',
      'Masc_Media',
      'Fem_Min',
      'Fem_Max',
      'Fem_Media',
      'Total_Min',
      'Total_Max',
      'Total_Media',
      'Ouros',
      'Pratas',
      'Bronzes',
    ];

    const rows = sorted.map((s, idx) => [
      idx + 1,
      s.athletic.name,
      s.maleMin,
      s.maleMax,
      s.maleAvg.toFixed(1).replace('.', ','),
      s.femaleMin,
      s.femaleMax,
      s.femaleAvg.toFixed(1).replace('.', ','),
      s.totalMin,
      s.totalMax,
      s.totalAvg.toFixed(1).replace('.', ','),
      s.goldCount,
      s.silverCount,
      s.bronzeCount,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Classificacao_FIFA_UFU_2026_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmtPts = (min: number, max: number) => {
    if (min === max) {
      return (
        <span className="font-mono text-sm font-extrabold text-white">
          {min}{' '}
          <span className="text-[10px] font-normal text-zinc-400">pts</span>
        </span>
      );
    }
    return (
      <span className="font-mono text-xs font-semibold text-zinc-200">
        {min} ~ {max}{' '}
        <span className="text-[10px] font-normal text-zinc-400">
          (méd. {((min + max) / 2).toFixed(1).replace('.', ',')})
        </span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Cards de Destaque KPI */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {/* Líder Geral */}
        <div className="card border-gold/40 bg-gradient-to-br from-amber-500/15 via-card to-card p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              🏆 Líder Geral do FIFA
            </span>
            <Trophy size={16} className="text-gold" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <AthleticBadge athletic={top1Total.athletic} size={28} />
            <div>
              <div className="font-display text-sm font-extrabold text-white">
                {displayName(top1Total.athletic)}
              </div>
              <div className="text-xs text-amber-200">
                Total:{' '}
                <strong>
                  {top1Total.totalMin === top1Total.totalMax
                    ? `${top1Total.totalMin} pts`
                    : `${top1Total.totalMin} ~ ${top1Total.totalMax} pts`}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Líder Masculino */}
        <div className="card border-sky-500/40 bg-gradient-to-br from-sky-500/15 via-card to-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
              👦 Líder E-Sports Masculino
            </span>
            <Medal size={16} className="text-sky-400" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <AthleticBadge athletic={top1Male.athletic} size={28} />
            <div>
              <div className="font-display text-sm font-extrabold text-white">
                {displayName(top1Male.athletic)}
              </div>
              <div className="text-xs text-sky-200">
                Masc:{' '}
                <strong>
                  {top1Male.maleMin === top1Male.maleMax
                    ? `${top1Male.maleMin} pts`
                    : `${top1Male.maleMin} ~ ${top1Male.maleMax} pts`}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Líder Feminino */}
        <div className="card border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/15 via-card to-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-300">
              👧 Líder E-Sports Feminino
            </span>
            <Medal size={16} className="text-fuchsia-400" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <AthleticBadge athletic={top1Female.athletic} size={28} />
            <div>
              <div className="font-display text-sm font-extrabold text-white">
                {displayName(top1Female.athletic)}
              </div>
              <div className="text-xs text-fuchsia-200">
                Fem:{' '}
                <strong>
                  {top1Female.femaleMin === top1Female.femaleMax
                    ? `${top1Female.femaleMin} pts`
                    : `${top1Female.femaleMin} ~ ${top1Female.femaleMax} pts`}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles e Filtros da Tabela */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Ordenação por Métrica */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-400">
              Ordenar por:
            </span>
            <div className="inline-flex rounded-lg border border-line bg-ink-950 p-0.5">
              <button
                onClick={() => setMetric('total')}
                className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                  metric === 'total'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🏆 Total Somado
              </button>
              <button
                onClick={() => setMetric('male')}
                className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                  metric === 'male'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                👦 Masculino
              </button>
              <button
                onClick={() => setMetric('female')}
                className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                  metric === 'female'
                    ? 'bg-fuchsia-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                👧 Feminino
              </button>
            </div>
          </div>

          {/* Regra de Pontuação & Ações de Exportação */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-line bg-ink-950 px-2.5 py-1 text-xs text-zinc-400">
              <span className="hidden md:inline">Regra de cálculo:</span>
              <select
                value={fifaState.scoreAggregation}
                onChange={(e) =>
                  onAggregationChange(e.target.value as 'sum' | 'best')
                }
                className="bg-transparent font-bold text-orange-400 focus:outline-none cursor-pointer"
                title="Alternar entre somar todos os atletas que pontuarem ou contar apenas o melhor colocado"
              >
                <option value="sum" className="bg-ink-900 text-zinc-200">
                  Somar todos atletas da atlética
                </option>
                <option value="best" className="bg-ink-900 text-zinc-200">
                  Apenas melhor colocado
                </option>
              </select>
            </div>

            {onSimulateAll && (
              <button
                onClick={onSimulateAll}
                className="btn-ghost text-xs text-amber-400 hover:text-amber-300"
                title="Simular resultados para AMBAS as chaves (Masculino + Feminino) até as Finais"
              >
                <Dices size={13} />
                <span className="hidden sm:inline">Simular Ambos</span>
              </button>
            )}

            {onResetAll && (
              <button
                onClick={onResetAll}
                className="btn-ghost text-xs text-rose-400 hover:text-rose-300"
                title="Zerar resultados de ambas as chaves"
              >
                <Eraser size={13} />
                <span className="hidden sm:inline">Zerar</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="btn-ghost text-xs text-emerald-400 hover:text-emerald-300"
              title="Baixar planilha CSV formatada para Excel"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Excel/CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="btn-ghost text-xs"
              title="Imprimir classificação oficial do FIFA"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Buscar atlética por nome ou sigla..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink-950 py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-brand focus:outline-none"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Tabela Principal */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line bg-ink-900/80 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-3 pl-3 pr-2 text-center w-12">#</th>
                <th className="py-3 px-3">Atlética</th>
                <th className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 text-sky-300">
                    👦 Masculino
                  </span>
                </th>
                <th className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 text-fuchsia-300">
                    👧 Feminino
                  </span>
                </th>
                <th className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 text-amber-300 font-extrabold">
                    🏆 Total Somado
                  </span>
                </th>
                <th className="py-3 px-3 text-center w-24">Medalhas</th>
                <th className="py-3 pr-3 pl-1 text-center w-10">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.map((s, idx) => {
                const pos = idx + 1;
                const isPodium = pos <= 3;
                const isExpanded = expandedRows[s.athletic.id];

                return (
                  <tr
                    key={s.athletic.id}
                    className={`transition-colors ${
                      isPodium
                        ? pos === 1
                          ? 'bg-amber-500/10 hover:bg-amber-500/15'
                          : pos === 2
                            ? 'bg-zinc-400/5 hover:bg-zinc-400/10'
                            : 'bg-orange-700/5 hover:bg-orange-700/10'
                        : 'hover:bg-card-hi/50'
                    }`}
                  >
                    {/* Posição */}
                    <td className="py-3 pl-3 pr-2 text-center font-bold">
                      {pos === 1 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-gold text-xs shadow-xs">
                          🥇
                        </span>
                      ) : pos === 2 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-300/20 text-zinc-300 text-xs">
                          🥈
                        </span>
                      ) : pos === 3 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-700/20 text-amber-600 text-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="font-mono text-zinc-400">{pos}º</span>
                      )}
                    </td>

                    {/* Atlética */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <AthleticBadge athletic={s.athletic} size={24} />
                        <div>
                          <div className="font-semibold text-zinc-100">
                            {s.athletic.name}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">
                            {s.athletic.short}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Masculino */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center">
                        {fmtPts(s.maleMin, s.maleMax)}
                        <span className="text-[10px] text-zinc-400">
                          {s.maleAthletes.length} atleta(s)
                        </span>
                      </div>
                    </td>

                    {/* Feminino */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center">
                        {fmtPts(s.femaleMin, s.femaleMax)}
                        <span className="text-[10px] text-zinc-400">
                          {s.femaleAthletes.length} atleta(s)
                        </span>
                      </div>
                    </td>

                    {/* Total Somado (Masc + Fem) */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center rounded-lg border border-brand/40 bg-brand/10 px-3 py-1">
                        {s.totalMin === s.totalMax ? (
                          <>
                            <span className="font-mono text-base font-extrabold text-orange-300">
                              {s.totalMin}{' '}
                              <span className="text-[10px] font-normal">pts</span>
                            </span>
                            <span className="text-[9px] font-bold text-emerald-400">
                              ✓ Pontuação final
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-mono text-xs font-bold text-orange-200">
                              {s.totalMin} ~ {s.totalMax} pts
                            </span>
                            <span className="text-[9px] font-semibold text-orange-400/80">
                              Projeção (méd. {s.totalAvg.toFixed(1).replace('.', ',')})
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Medalhas */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono text-xs">
                        {s.goldCount > 0 && (
                          <span className="rounded bg-amber-500/20 px-1 text-gold font-bold">
                            🥇{s.goldCount}
                          </span>
                        )}
                        {s.silverCount > 0 && (
                          <span className="rounded bg-zinc-300/20 px-1 text-zinc-300 font-bold">
                            🥈{s.silverCount}
                          </span>
                        )}
                        {s.bronzeCount > 0 && (
                          <span className="rounded bg-orange-700/20 px-1 text-amber-500 font-bold">
                            🥉{s.bronzeCount}
                          </span>
                        )}
                        {s.goldCount === 0 &&
                          s.silverCount === 0 &&
                          s.bronzeCount === 0 && (
                            <span className="text-zinc-600">-</span>
                          )}
                      </div>
                    </td>

                    {/* Botão de Expansão */}
                    <td className="py-3 pr-3 pl-1 text-center">
                      <button
                        onClick={() => toggleExpand(s.athletic.id)}
                        className="rounded p-1 text-zinc-400 hover:bg-card hover:text-white"
                        title={
                          isExpanded
                            ? 'Ocultar atletas'
                            : 'Ver atletas e colocações'
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Linhas Expandidas com Detalhamento dos Atletas */}
        {filtered.map((s) => {
          if (!expandedRows[s.athletic.id]) return null;
          return (
            <div
              key={`detail-${s.athletic.id}`}
              className="border-b border-line/80 bg-ink-950/70 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Desempenho dos Atletas · {s.athletic.name}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {s.maleAthletes.length + s.femaleAthletes.length} atletas
                  inscritos no total
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Atletas Masculinos */}
                <div className="rounded-lg border border-sky-900/40 bg-sky-950/20 p-2.5">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-sky-300">
                    <span>👦 Masculino</span>
                    <button
                      onClick={() => onNavigateToBracket?.('M')}
                      className="text-[10px] underline hover:text-white"
                    >
                      Ver na Chave
                    </button>
                  </div>
                  {s.maleAthletes.length === 0 ? (
                    <span className="text-[11px] text-zinc-500 italic">
                      Nenhum atleta inscrito
                    </span>
                  ) : (
                    <div className="space-y-1">
                      {s.maleAthletes.map((a) => (
                        <div
                          key={a.athlete.id}
                          className="flex items-center justify-between rounded bg-ink-900/70 px-2 py-1 text-xs"
                        >
                          <span className="font-semibold text-zinc-200">
                            {a.athlete.name}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              a.place
                                ? 'bg-amber-500/20 text-gold'
                                : a.isEliminated
                                  ? 'text-zinc-500'
                                  : 'bg-sky-500/20 text-sky-300'
                            }`}
                          >
                            {a.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Atletas Femininas */}
                <div className="rounded-lg border border-fuchsia-900/40 bg-fuchsia-950/20 p-2.5">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-fuchsia-300">
                    <span>👧 Feminino</span>
                    <button
                      onClick={() => onNavigateToBracket?.('F')}
                      className="text-[10px] underline hover:text-white"
                    >
                      Ver na Chave
                    </button>
                  </div>
                  {s.femaleAthletes.length === 0 ? (
                    <span className="text-[11px] text-zinc-500 italic">
                      Nenhuma atleta inscrita
                    </span>
                  ) : (
                    <div className="space-y-1">
                      {s.femaleAthletes.map((a) => (
                        <div
                          key={a.athlete.id}
                          className="flex items-center justify-between rounded bg-ink-900/70 px-2 py-1 text-xs"
                        >
                          <span className="font-semibold text-zinc-200">
                            {a.athlete.name}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              a.place
                                ? 'bg-amber-500/20 text-gold'
                                : a.isEliminated
                                  ? 'text-zinc-500'
                                  : 'bg-fuchsia-500/20 text-fuchsia-300'
                            }`}
                          >
                            {a.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
