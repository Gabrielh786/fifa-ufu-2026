import { useMemo } from 'react';
import {
  BookmarkCheck,
  Dices,
  Eraser,
  Lock,
  Trophy,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import type { Athletic } from '../../types';
import type { FifaAthlete } from '../../data/fifaData2026';
import {
  OFFICIAL_FIFA_MALE_SLOTS,
  OFFICIAL_FIFA_FEMALE_SLOTS,
} from '../../data/fifaData2026';
import {
  resolveFifaTournament,
  sanitizeFifaBracket,
  simulateFifaBracket,
  type FifaMatch,
} from '../../lib/fifaEngine';
import { AthleticBadge, displayName } from '../ui';
import { FifaMatchCard } from './FifaMatchCard';

interface Props {
  gender: 'M' | 'F';
  slots: (string | null)[];
  winners: (string | null)[][];
  thirdWinner: string | null;
  consolationWinners: (string | null)[];
  fifthWinner: string | null;
  seventhWinner: string | null;
  athletes: FifaAthlete[];
  athletics: Athletic[];
  onChange: (updates: {
    winners: (string | null)[][];
    thirdWinner: string | null;
    consolationWinners: (string | null)[];
    fifthWinner: string | null;
    seventhWinner: string | null;
    slots?: (string | null)[];
  }) => void;
  onOpenAthletesModal: () => void;
  notify: (text: string, kind?: 'ok' | 'err' | 'info') => void;
  readOnly?: boolean;
}

const CARD_W = 'w-[200px]';

export function FifaBracketView({
  gender,
  slots,
  winners,
  thirdWinner,
  consolationWinners,
  fifthWinner,
  seventhWinner,
  athletes,
  athletics,
  onChange,
  onOpenAthletesModal,
  notify,
  readOnly = false,
}: Props) {
  const athleteMap = useMemo(
    () => new Map(athletes.map((a) => [a.id, a])),
    [athletes],
  );
  const athleticMap = useMemo(
    () => new Map(athletics.map((a) => [a.id, a])),
    [athletics],
  );

  const getAthlete = (id: string | null) => (id ? athleteMap.get(id) : undefined);
  const getAthletic = (id: string) => athleticMap.get(id);

  const resolved = useMemo(
    () =>
      resolveFifaTournament(
        slots,
        winners,
        thirdWinner,
        consolationWinners,
        fifthWinner,
        seventhWinner,
      ),
    [slots, winners, thirdWinner, consolationWinners, fifthWinner, seventhWinner],
  );

  // Manipulador de clique no vencedor de qualquer partida
  const handlePick = (match: FifaMatch, pickedAthleteId: string) => {
    if (readOnly) return;

    if (match.round === -1) {
      // Decisão de 3º lugar (JG34)
      const newThird = thirdWinner === pickedAthleteId ? null : pickedAthleteId;
      const sanitized = sanitizeFifaBracket(
        slots,
        winners,
        newThird,
        consolationWinners,
        fifthWinner,
        seventhWinner,
      );
      onChange(sanitized);
      return;
    }

    if (match.round === -2) {
      // Semifinais de Consolação (JG31 e JG32)
      const nextCons = [...consolationWinners];
      nextCons[match.index] =
        nextCons[match.index] === pickedAthleteId ? null : pickedAthleteId;
      const sanitized = sanitizeFifaBracket(
        slots,
        winners,
        thirdWinner,
        nextCons,
        fifthWinner,
        seventhWinner,
      );
      onChange(sanitized);
      return;
    }

    if (match.round === -3) {
      // Final 5º/6º lugar (JG35)
      const newFifth = fifthWinner === pickedAthleteId ? null : pickedAthleteId;
      const sanitized = sanitizeFifaBracket(
        slots,
        winners,
        thirdWinner,
        consolationWinners,
        newFifth,
        seventhWinner,
      );
      onChange(sanitized);
      return;
    }

    if (match.round === -4) {
      // Final 7º/8º lugar (JG36)
      const newSeventh =
        seventhWinner === pickedAthleteId ? null : pickedAthleteId;
      const sanitized = sanitizeFifaBracket(
        slots,
        winners,
        thirdWinner,
        consolationWinners,
        fifthWinner,
        newSeventh,
      );
      onChange(sanitized);
      return;
    }

    // Rodadas normais da chave (0 a 4)
    const nextWinners = winners.map((r) => [...r]);
    const current = nextWinners[match.round]?.[match.index];
    nextWinners[match.round][match.index] =
      current === pickedAthleteId ? null : pickedAthleteId;

    const sanitized = sanitizeFifaBracket(
      slots,
      nextWinners,
      thirdWinner,
      consolationWinners,
      fifthWinner,
      seventhWinner,
    );

    onChange({
      winners: sanitized.winners,
      thirdWinner: sanitized.thirdWinner,
      consolationWinners: sanitized.consolationWinners,
      fifthWinner: sanitized.fifthWinner,
      seventhWinner: sanitized.seventhWinner,
    });
  };

  // Zerar resultados da chave
  const handleClearResults = () => {
    if (
      !confirm(
        `Zerar todos os resultados da chave ${gender === 'M' ? 'Masculina' : 'Feminina'} de FIFA? A estrutura e os atletas serão mantidos.`,
      )
    )
      return;

    onChange({
      winners: [
        Array(16).fill(null),
        Array(8).fill(null),
        Array(4).fill(null),
        Array(2).fill(null),
        Array(1).fill(null),
      ],
      thirdWinner: null,
      consolationWinners: [null, null],
      fifthWinner: null,
      seventhWinner: null,
    });
    notify('Resultados da chave zerados com sucesso.', 'info');
  };

  // Restaurar sorteio oficial do Congresso Técnico UFU 2026
  const handleRestoreOfficial = () => {
    if (
      !confirm(
        `Restaurar o sorteio oficial do Congresso Técnico UFU 2026 para o FIFA ${gender === 'M' ? 'Masculino' : 'Feminino'}? Todos os resultados da chave serão reiniciados.`,
      )
    )
      return;

    const officialSlots =
      gender === 'M' ? OFFICIAL_FIFA_MALE_SLOTS : OFFICIAL_FIFA_FEMALE_SLOTS;

    onChange({
      slots: [...officialSlots],
      winners: [
        Array(16).fill(null),
        Array(8).fill(null),
        Array(4).fill(null),
        Array(2).fill(null),
        Array(1).fill(null),
      ],
      thirdWinner: null,
      consolationWinners: [null, null],
      fifthWinner: null,
      seventhWinner: null,
    });
    notify(
      `📋 Sorteio oficial UFU 2026 do FIFA ${gender === 'M' ? 'Masculino' : 'Feminino'} restaurado!`,
      'ok',
    );
  };

  // Simular confrontos aleatórios para demonstração/teste
  const handleRandomSimulation = () => {
    if (
      !confirm(
        `Simular 100% dos resultados aleatórios até a Final para a Chave ${gender === 'M' ? 'Masculina' : 'Feminina'}?`,
      )
    )
      return;

    const simulated = simulateFifaBracket(slots);
    onChange({
      winners: simulated.winners,
      thirdWinner: simulated.thirdWinner,
      consolationWinners: simulated.consolationWinners,
      fifthWinner: simulated.fifthWinner,
      seventhWinner: simulated.seventhWinner,
    });
    notify(`🎲 Chave ${gender === 'M' ? 'Masculina' : 'Feminina'} 100% simulada com sucesso!`, 'ok');
  };

  const definedMatchesCount = resolved.allMatches.filter(
    (m) => m.winner != null,
  ).length;

  const championId = resolved.finalMatch.winner;
  const championAthlete = championId ? getAthlete(championId) : undefined;
  const championAthletic = championAthlete
    ? getAthletic(championAthlete.athleticId)
    : undefined;

  // Layout de colunas por lado
  const renderSideColumn = (
    roundIndex: number,
    side: 'L' | 'R',
    title: string,
  ) => {
    const matches = resolved.rounds[roundIndex];
    if (!matches) return null;
    const n = matches.length;
    const list =
      side === 'L' ? matches.slice(0, n / 2) : matches.slice(n / 2);

    return (
      <div key={`${side}-${roundIndex}`} className="flex flex-col">
        <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          {title}
        </div>
        <div
          className="flex flex-1 flex-col justify-around gap-2"
          style={{ minHeight: 8 * 84 }}
        >
          {list.map((m) => {
            let placeholders: [string, string] | undefined;
            if (m.round === 3) {
              placeholders =
                m.index === 0
                  ? ['Venc. JG25 (Quartas)', 'Venc. JG28 (Quartas)']
                  : ['Venc. JG26 (Quartas)', 'Venc. JG27 (Quartas)'];
            } else if (m.round === 2) {
              if (m.index === 0) placeholders = ['Venc. JG17 (Oitavas)', 'Venc. JG21 (Oitavas)'];
              else if (m.index === 1) placeholders = ['Venc. JG24 (Oitavas)', 'Venc. JG20 (Oitavas)'];
              else if (m.index === 2) placeholders = ['Venc. JG18 (Oitavas)', 'Venc. JG22 (Oitavas)'];
              else if (m.index === 3) placeholders = ['Venc. JG23 (Oitavas)', 'Venc. JG19 (Oitavas)'];
            } else if (m.round === 1) {
              if (m.index === 0) placeholders = ['Venc. JG1', 'Venc. JG9'];
              else if (m.index === 1) placeholders = ['Venc. JG5', 'Venc. JG13'];
              else if (m.index === 2) placeholders = ['Venc. JG8', 'Venc. JG16'];
              else if (m.index === 3) placeholders = ['Venc. JG4', 'Venc. JG12'];
              else if (m.index === 4) placeholders = ['Venc. JG2', 'Venc. JG10'];
              else if (m.index === 5) placeholders = ['Venc. JG6', 'Venc. JG14'];
              else if (m.index === 6) placeholders = ['Venc. JG7', 'Venc. JG15'];
              else if (m.index === 7) placeholders = ['Venc. JG3', 'Venc. JG11'];
            }

            return (
              <FifaMatchCard
                key={`${m.round}-${m.index}`}
                match={m}
                className={CARD_W}
                onPick={(c) => handlePick(m, c)}
                getAthlete={getAthlete}
                getAthletic={getAthletic}
                readOnly={readOnly}
                placeholders={placeholders}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="card overflow-hidden">
      {/* Barra de Ferramentas Superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink-900/60 px-3 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <Users size={15} className="text-brand shrink-0" />
            <span>
              {gender === 'M' ? 'E-Sports Masculino' : 'E-Sports Feminino'}
            </span>
          </div>
          <span className="rounded-full border border-line bg-ink-950 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
            <strong className="text-orange-400">{definedMatchesCount}</strong> de{' '}
            {resolved.allMatches.length} jogos definidos
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
            1 clique avança · elimina adversário
          </span>
        </div>

        {readOnly ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink-950/70 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
            <Lock size={12} className="text-zinc-500" />
            <span>Modo Visualização</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              className="btn-brand text-xs font-bold"
              onClick={handleRestoreOfficial}
              title="Restaurar sorteio oficial do Congresso Técnico UFU 2026"
            >
              <BookmarkCheck size={13} />
              <span className="hidden sm:inline">Chave Oficial UFU</span>
            </button>

            <button
              className="btn-ghost text-xs"
              onClick={onOpenAthletesModal}
              title="Atualizar nomes dos atletas e escalações"
            >
              <UserCheck size={13} className="text-brand" />
              <span>Atualizar Atletas</span>
            </button>

            <button
              className="btn-ghost text-xs"
              onClick={handleRandomSimulation}
              title="Simular resultados aleatórios para teste"
            >
              <Dices size={13} />
              <span className="hidden md:inline">Simular (Teste)</span>
            </button>

            <button
              className="btn-danger text-xs"
              onClick={handleClearResults}
              disabled={definedMatchesCount === 0}
              title="Limpar todos os resultados desta chave"
            >
              <Eraser size={13} />
              <span className="hidden sm:inline">Zerar</span>
            </button>
          </div>
        )}
      </div>

      {/* Dica para mobile */}
      <div className="block lg:hidden border-b border-line/60 bg-ink-950/50 px-3 py-1.5 text-center text-[10px] text-zinc-400">
        ↔️ Deslize horizontalmente para visualizar todas as fases do chaveamento
      </div>

      {/* Bracket Principal Bilateral */}
      <div className="overflow-x-auto px-3 pb-8 pt-5 sm:px-5">
        <div className="mx-auto flex w-max items-stretch gap-3">
          {/* LADO ESQUERDO DA CHAVE */}
          <div className="flex flex-col">
            <div className="mb-3 rounded-md border border-sky-900/60 bg-sky-950/30 px-3 py-1 text-center text-[10px] font-bold tracking-widest text-sky-300">
              LADO ESQUERDO · CONFRONTOS 1 A 8
            </div>
            <div className="flex gap-3">
              {renderSideColumn(0, 'L', '16-avos de Final')}
              {renderSideColumn(1, 'L', 'Oitavas de Final')}
              {renderSideColumn(2, 'L', 'Quartas de Final')}
              {renderSideColumn(3, 'L', 'Semifinal 1 (JG29)')}
            </div>
          </div>

          {/* COLUNA CENTRAL: GRANDE FINAL, DECISÃO 3º LUGAR E DISPUTA 5º AO 8º */}
          <div className="flex w-[290px] flex-col items-center justify-start gap-4 px-1">
            {/* Bloco Campeão */}
            <div className="flex w-full flex-col items-center gap-1 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-transparent shadow-[0_0_30px_-5px_rgba(245,158,11,0.6)]">
                <Trophy size={24} className="text-gold" />
              </div>
              {championAthlete && championAthletic ? (
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    🏆 CAMPEÃO(Ã) DO FIFA
                  </span>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <AthleticBadge athletic={championAthletic} size={22} />
                    <span className="font-display text-sm font-extrabold text-white">
                      {championAthlete.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    {displayName(championAthletic)} · 13 PONTOS
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Grande Final UFU 2026
                </span>
              )}
            </div>

            {/* Grande Final (Jogo 33) */}
            <FifaMatchCard
              className="w-full"
              variant="final"
              match={resolved.finalMatch}
              onPick={(c) => handlePick(resolved.finalMatch, c)}
              getAthlete={getAthlete}
              getAthletic={getAthletic}
              readOnly={readOnly}
              placeholders={['Vencedor JG29 (Semi 1)', 'Vencedor JG30 (Semi 2)']}
            />

            {/* Decisão de 3º Lugar (Jogo 34) */}
            <FifaMatchCard
              className="w-full"
              variant="third"
              match={resolved.thirdMatch}
              onPick={(c) => handlePick(resolved.thirdMatch, c)}
              getAthlete={getAthlete}
              getAthletic={getAthletic}
              readOnly={readOnly}
              placeholders={['Perdedor JG29 (Semi 1)', 'Perdedor JG30 (Semi 2)']}
            />

            {/* BLOCO OFICIAL DA DISPUTA DE 5º AO 8º LUGAR */}
            <div className="w-full rounded-xl border border-amber-600/40 bg-gradient-to-b from-amber-950/20 via-card to-card p-2.5 shadow-md">
              <div className="mb-2 flex items-center justify-between border-b border-line/60 pb-1.5">
                <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                  Disputa de 5º ao 8º Lugar
                </span>
                <span className="rounded bg-amber-500/15 px-1 py-0.2 text-[8px] font-bold text-amber-300">
                  Art. 79 Oficial
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  Semis 5º ao 8º
                </div>
                <FifaMatchCard
                  className="w-full"
                  variant="consolation"
                  match={resolved.consolationSemis[0]}
                  onPick={(c) => handlePick(resolved.consolationSemis[0], c)}
                  getAthlete={getAthlete}
                  getAthletic={getAthletic}
                  readOnly={readOnly}
                  placeholders={['Perdedor JG25 (Quartas)', 'Perdedor JG28 (Quartas)']}
                />
                <FifaMatchCard
                  className="w-full"
                  variant="consolation"
                  match={resolved.consolationSemis[1]}
                  onPick={(c) => handlePick(resolved.consolationSemis[1], c)}
                  getAthlete={getAthlete}
                  getAthletic={getAthletic}
                  readOnly={readOnly}
                  placeholders={['Perdedor JG26 (Quartas)', 'Perdedor JG27 (Quartas)']}
                />

                <div className="border-t border-line/60 pt-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  Finais de Posição
                </div>
                <FifaMatchCard
                  className="w-full"
                  variant="consolation"
                  match={resolved.fifthMatch}
                  onPick={(c) => handlePick(resolved.fifthMatch, c)}
                  getAthlete={getAthlete}
                  getAthletic={getAthletic}
                  readOnly={readOnly}
                  placeholders={['Vencedor JG31 (5º/6º)', 'Vencedor JG32 (5º/6º)']}
                />
                <FifaMatchCard
                  className="w-full"
                  variant="consolation"
                  match={resolved.seventhMatch}
                  onPick={(c) => handlePick(resolved.seventhMatch, c)}
                  getAthlete={getAthlete}
                  getAthletic={getAthletic}
                  readOnly={readOnly}
                  placeholders={['Perdedor JG31 (7º/8º)', 'Perdedor JG32 (7º/8º)']}
                />
              </div>
            </div>

            <p className="flex items-center gap-1 text-center text-[9px] text-zinc-500">
              <Zap size={10} className="text-amber-400 shrink-0" />
              Perdedores das quartas disputam posições de 5º a 8º lugar.
            </p>
          </div>

          {/* LADO DIREITO DA CHAVE */}
          <div className="flex flex-col">
            <div className="mb-3 rounded-md border border-fuchsia-900/60 bg-fuchsia-950/30 px-3 py-1 text-center text-[10px] font-bold tracking-widest text-fuchsia-300">
              LADO DIREITO · CONFRONTOS 9 A 16
            </div>
            <div className="flex gap-3">
              {renderSideColumn(3, 'R', 'Semifinal 2 (JG30)')}
              {renderSideColumn(2, 'R', 'Quartas de Final')}
              {renderSideColumn(1, 'R', 'Oitavas de Final')}
              {renderSideColumn(0, 'R', '16-avos de Final')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
