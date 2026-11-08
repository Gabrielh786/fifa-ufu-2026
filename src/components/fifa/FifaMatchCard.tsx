import { Check, Crown, Medal, Trophy, Zap } from 'lucide-react';
import type { Athletic } from '../../types';
import type { FifaAthlete } from '../../data/fifaData2026';
import type { FifaMatch } from '../../lib/fifaEngine';
import { isLoserMarker, getTargetLoserMatch } from '../../lib/fifaEngine';
import { AthleticBadge, displayName } from '../ui';

interface Props {
  match: FifaMatch;
  variant?: 'normal' | 'final' | 'third' | 'consolation';
  onPick: (athleteId: string) => void;
  getAthlete: (id: string | null) => FifaAthlete | undefined;
  getAthletic: (athleticId: string) => Athletic | undefined;
  readOnly?: boolean;
  className?: string;
  placeholders?: [string, string];
}

export function FifaMatchCard({
  match,
  variant = 'normal',
  onPick,
  getAthlete,
  getAthletic,
  readOnly = false,
  className = '',
  placeholders,
}: Props) {
  const ready = Boolean(
    match.a &&
      match.b &&
      !isLoserMarker(match.a) &&
      !isLoserMarker(match.b),
  );
  const decided = match.winner != null;

  const frame =
    variant === 'final'
      ? 'border-gold/60 bg-gradient-to-b from-amber-500/20 via-card to-card shadow-[0_0_35px_-10px_rgba(245,158,11,0.5)]'
      : variant === 'third'
        ? 'border-orange-500/50 bg-gradient-to-b from-orange-500/15 via-card to-card shadow-[0_0_25px_-10px_rgba(249,115,22,0.4)]'
        : variant === 'consolation'
          ? 'border-amber-600/40 bg-gradient-to-b from-amber-950/25 to-card shadow-xs'
          : decided
            ? 'border-line bg-card'
            : ready
              ? 'border-brand/50 bg-card shadow-[0_0_15px_-8px_rgba(249,115,22,0.4)]'
              : 'border-line/70 bg-ink-850';

  const renderCompetitor = (value: string | null, sideIndex: 0 | 1) => {
    // Slot com marcador de repescagem (ex: LOSER:1)
    if (isLoserMarker(value)) {
      const matchNum = getTargetLoserMatch(value as string);
      return (
        <div className="flex h-[34px] items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 text-[10px] font-semibold text-amber-300">
          <Zap size={11} className="text-amber-400 shrink-0" />
          <span className="truncate">Perd. Jogo {matchNum} (Repescagem)</span>
        </div>
      );
    }

    if (!value) {
      const fallback = placeholders?.[sideIndex] ?? 'Aguardando definição...';
      return (
        <div className="flex h-[34px] items-center gap-1.5 rounded-md border border-dashed border-line/70 bg-ink-950/40 px-2 text-[10px] italic text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
          <span className="truncate">{fallback}</span>
        </div>
      );
    }

    const athlete = getAthlete(value);
    const ath = athlete ? getAthletic(athlete.athleticId) : undefined;
    const isWinner = match.winner === value;
    const isLoser = decided && !isWinner;
    const clickable = ready && !readOnly;
    const isChampion = variant === 'final' && isWinner;

    return (
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={() => clickable && onPick(value)}
        onKeyDown={(e) => {
          if (clickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onPick(value);
          }
        }}
        title={
          clickable
            ? isWinner
              ? 'Clique para desfazer / avançar adversário'
              : `Clique para definir ${athlete?.name ?? value} como vencedor(a)`
            : athlete?.name
        }
        className={`group relative flex h-[34px] items-center gap-2 rounded-md border px-2 text-[12px] transition-all ${
          isWinner
            ? isChampion
              ? 'border-gold/80 bg-gradient-to-r from-amber-500/35 to-amber-600/10 font-bold text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'border-brand/80 bg-gradient-to-r from-brand/30 to-brand/10 font-bold text-white shadow-[0_0_10px_rgba(249,115,22,0.25)]'
            : isLoser
              ? 'border-transparent bg-ink-950/40 text-zinc-500 line-through opacity-55'
              : 'border-line/60 bg-ink-900/60 text-zinc-200 hover:border-zinc-500'
        } ${clickable ? 'cursor-pointer hover:border-brand/70 hover:bg-brand/10' : ''}`}
      >
        {isWinner && (
          <span
            className={`absolute -left-px top-1.5 bottom-1.5 w-[3px] rounded-full ${
              isChampion ? 'bg-gold' : 'bg-brand'
            }`}
          />
        )}

        {ath && <AthleticBadge athletic={ath} size={20} />}

        <div className="flex min-w-0 flex-1 flex-col justify-center leading-tight">
          <span className="truncate font-semibold">
            {athlete ? athlete.name : value}
          </span>
          <span className="truncate text-[9px] font-mono text-zinc-400">
            {ath ? displayName(ath) : ''}
          </span>
        </div>

        {athlete?.isSeed && (
          <span
            className="shrink-0 rounded bg-emerald-500/20 px-1 py-0.2 text-[8px] font-bold text-emerald-300"
            title="Cabeça de Chave Sorteado"
          >
            SEED
          </span>
        )}

        {isWinner && (
          isChampion ? (
            <Crown size={14} className="ml-auto shrink-0 text-gold" />
          ) : (
            <Check size={14} className="ml-auto shrink-0 text-brand" />
          )
        )}
      </div>
    );
  };

  return (
    <div className={`relative rounded-lg border p-1.5 ${frame} ${className}`}>
      {/* Cabeçalho do Card */}
      <div className="mb-1 flex items-center justify-between px-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
        <div className="flex items-center gap-1">
          {variant === 'final' && <Trophy size={11} className="text-gold" />}
          {variant === 'third' && <Medal size={11} className="text-orange-400" />}
          <span
            className={
              variant === 'final'
                ? 'text-amber-300'
                : variant === 'third'
                  ? 'text-orange-300'
                  : variant === 'consolation'
                    ? 'text-amber-400'
                    : ''
            }
          >
            {match.label}
          </span>
        </div>
        <span className="rounded bg-ink-950/80 px-1.5 py-0.2 font-mono text-[8px] font-bold text-zinc-400 border border-line/40">
          JG{match.matchNumber}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {renderCompetitor(match.a, 0)}
        {renderCompetitor(match.b, 1)}
      </div>
    </div>
  );
}
