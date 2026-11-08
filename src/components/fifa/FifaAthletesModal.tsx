import { useState } from 'react';
import {
  Check,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import type { Athletic } from '../../types';
import type { FifaAthlete } from '../../data/fifaData2026';
import {
  OFFICIAL_FIFA_MALE_ATHLETES,
  OFFICIAL_FIFA_FEMALE_ATHLETES,
} from '../../data/fifaData2026';
import { AthleticBadge } from '../ui';

interface Props {
  open: boolean;
  onClose: () => void;
  athletes: FifaAthlete[];
  athletics: Athletic[];
  onSaveAthletes: (updated: FifaAthlete[]) => void;
  notify: (text: string, kind?: 'ok' | 'err' | 'info') => void;
}

export function FifaAthletesModal({
  open,
  onClose,
  athletes,
  athletics,
  onSaveAthletes,
  notify,
}: Props) {
  const [list, setList] = useState<FifaAthlete[]>(athletes);
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [filterAthletic, setFilterAthletic] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Sincroniza quando abrir
  useState(() => {
    setList(athletes);
  });

  if (!open) return null;

  const athleticMap = new Map(athletics.map((a) => [a.id, a]));

  const filtered = list.filter((a) => {
    if (filterGender !== 'all' && a.gender !== filterGender) return false;
    if (filterAthletic !== 'all' && a.athleticId !== filterAthletic) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const ath = athleticMap.get(a.athleticId);
      const athName = ath ? ath.name.toLowerCase() : '';
      if (!a.name.toLowerCase().includes(q) && !athName.includes(q))
        return false;
    }
    return true;
  });

  const handleUpdateName = (id: string, name: string) => {
    setList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item)),
    );
  };

  const handleUpdateAthletic = (id: string, athleticId: string) => {
    setList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, athleticId } : item)),
    );
  };

  const handleToggleSeed = (id: string) => {
    setList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSeed: !item.isSeed } : item,
      ),
    );
  };

  const handleRemove = (id: string) => {
    if (!confirm('Remover este atleta do sistema?')) return;
    setList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddNew = () => {
    const defaultAth = athletics[0]?.id ?? 'agrarias';
    const newAthlete: FifaAthlete = {
      id: `ath_custom_${Date.now()}`,
      name: 'Novo Atleta',
      athleticId: defaultAth,
      gender: filterGender === 'F' ? 'F' : 'M',
    };
    setList((prev) => [newAthlete, ...prev]);
  };

  const handleRestoreOfficial = () => {
    if (
      !confirm(
        'Restaurar a lista original completa com os 59 atletas oficiais sorteados no Congresso Técnico UFU 2026? Alterações manuais em nomes serão resetadas.',
      )
    )
      return;

    const restored = [
      ...OFFICIAL_FIFA_MALE_ATHLETES.map((a) => ({ ...a })),
      ...OFFICIAL_FIFA_FEMALE_ATHLETES.map((a) => ({ ...a })),
    ];
    setList(restored);
    notify('📋 Lista oficial de atletas restaurada com sucesso!', 'ok');
  };

  const handleSave = () => {
    onSaveAthletes(list);
    notify('✅ Atletas atualizados com sucesso!', 'ok');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs">
      <div className="card flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl border-brand/50">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-line bg-ink-900/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-brand" />
            <h3 className="font-display text-base font-extrabold text-white">
              Gerenciar & Atualizar Atletas do FIFA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-card-hi hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className="border-b border-line/60 bg-ink-950/60 p-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Gênero */}
            <div className="inline-flex rounded-lg border border-line bg-ink-900 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setFilterGender('all')}
                className={`rounded-md px-2.5 py-1 transition ${
                  filterGender === 'all'
                    ? 'bg-brand text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todos ({list.length})
              </button>
              <button
                onClick={() => setFilterGender('M')}
                className={`rounded-md px-2.5 py-1 transition ${
                  filterGender === 'M'
                    ? 'bg-sky-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                👦 Masc ({list.filter((a) => a.gender === 'M').length})
              </button>
              <button
                onClick={() => setFilterGender('F')}
                className={`rounded-md px-2.5 py-1 transition ${
                  filterGender === 'F'
                    ? 'bg-fuchsia-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                👧 Fem ({list.filter((a) => a.gender === 'F').length})
              </button>
            </div>

            {/* Atlética */}
            <select
              value={filterAthletic}
              onChange={(e) => setFilterAthletic(e.target.value)}
              className="select-dark py-1 text-xs"
            >
              <option value="all">Todas as Atléticas</option>
              {athletics.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Ações */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleAddNew}
                className="btn-ghost text-xs"
                title="Cadastrar novo atleta"
              >
                <Plus size={13} className="text-emerald-400" />
                <span>Adicionar</span>
              </button>
              <button
                onClick={handleRestoreOfficial}
                className="btn-ghost text-xs text-orange-300"
                title="Restaurar a lista original oficial de atletas"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Restaurar Oficial</span>
              </button>
            </div>
          </div>

          {/* Busca por nome */}
          <div className="relative mt-2.5">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Filtrar por nome do atleta ou atlética..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-line bg-ink-900 py-1 pl-7 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        {/* Lista de Atletas */}
        <div className="flex-1 overflow-y-auto p-3 sm:px-6 divide-y divide-line/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 italic">
              Nenhum atleta encontrado com os filtros selecionados.
            </div>
          ) : (
            filtered.map((ath) => {
              const athleticObj = athleticMap.get(ath.athleticId);
              return (
                <div
                  key={ath.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <div className="flex flex-1 min-w-[240px] items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        ath.gender === 'M'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-fuchsia-500/20 text-fuchsia-300'
                      }`}
                    >
                      {ath.gender}
                    </span>

                    <input
                      type="text"
                      value={ath.name}
                      onChange={(e) => handleUpdateName(ath.id, e.target.value)}
                      className="flex-1 rounded border border-line bg-ink-900 px-2 py-1 text-xs text-zinc-100 font-semibold focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Seletor de Atlética */}
                    <div className="flex items-center gap-1.5">
                      {athleticObj && (
                        <AthleticBadge athletic={athleticObj} size={18} />
                      )}
                      <select
                        value={ath.athleticId}
                        onChange={(e) =>
                          handleUpdateAthletic(ath.id, e.target.value)
                        }
                        className="select-dark py-1 text-xs max-w-[150px]"
                      >
                        {athletics.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Botão Cabeça de Chave */}
                    <button
                      onClick={() => handleToggleSeed(ath.id)}
                      className={`rounded px-2 py-1 text-[10px] font-bold transition ${
                        ath.isSeed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-ink-900 text-zinc-500 hover:text-zinc-300 border border-line'
                      }`}
                      title="Alternar condição de Cabeça de Chave"
                    >
                      {ath.isSeed ? 'SEED' : 'Comum'}
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => handleRemove(ath.id)}
                      className="rounded p-1 text-zinc-500 hover:bg-red-950/60 hover:text-red-300"
                      title="Remover atleta"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé com Salvar */}
        <div className="flex items-center justify-between border-t border-line bg-ink-900/60 px-4 py-3 sm:px-6">
          <span className="text-xs text-zinc-400">
            {list.length} atletas cadastrados no FIFA
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-ghost text-xs">
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-brand text-xs font-bold">
              <Check size={14} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
