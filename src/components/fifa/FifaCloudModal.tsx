import { useEffect, useState } from 'react';
import {
  Radio,
  RadioTower,
  ShieldCheck,
  Eye,
  RotateCcw,
  Upload,
  Download,
} from 'lucide-react';
import { Modal } from '../ui';
import { DEFAULT_FIFA_CLOUD_URL } from '../../lib/fifaStorage';

interface Props {
  open: boolean;
  onClose: () => void;
  cloudUrl: string;
  onSaveUrl: (url: string) => void;
  cloudStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: Date | null;
  isOperator: boolean;
  onToggleOperator: (val: boolean) => void;
  onForcePull: () => Promise<boolean>;
  onForcePush: () => Promise<boolean>;
  notify: (text: string, kind?: 'ok' | 'err' | 'info') => void;
}

export function FifaCloudModal({
  open,
  onClose,
  cloudUrl,
  onSaveUrl,
  cloudStatus,
  lastSyncTime,
  isOperator,
  onToggleOperator,
  onForcePull,
  onForcePush,
  notify,
}: Props) {
  const [inputUrl, setInputUrl] = useState(cloudUrl);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (open) setInputUrl(cloudUrl);
  }, [open, cloudUrl]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(inputUrl.trim());
    notify('URL do banco em nuvem atualizada com sucesso!', 'ok');
  };

  const handlePull = async () => {
    setActionLoading(true);
    const ok = await onForcePull();
    setActionLoading(false);
    if (ok) notify('Dados atualizados da nuvem com sucesso!', 'ok');
    else notify('Falha ao baixar dados da nuvem.', 'err');
  };

  const handlePush = async () => {
    setActionLoading(true);
    const ok = await onForcePush();
    setActionLoading(false);
    if (ok) notify('Dados enviados para a nuvem com sucesso!', 'ok');
    else notify('Falha ao enviar dados para a nuvem.', 'err');
  };

  return (
    <Modal open={open} onClose={onClose} title="Sincronização Ao Vivo · Banco em Nuvem">
      <div className="space-y-5 text-sm">
        {/* Seletor de Modo: Operador vs Espectador */}
        <div className="rounded-xl border border-line bg-ink-950/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Modo de Operação neste Aparelho
            </span>
            {isOperator ? (
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <ShieldCheck size={12} />
                OPERADOR (EDICTÁVEL)
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                <Eye size={12} />
                ESPECTADOR (AO VIVO)
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 mb-3">
            Defina se este aparelho será quem **atualiza as partidas ao vivo** ou se apenas **acompanha os resultados em tempo real**.
          </p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                onToggleOperator(true);
                notify('Modo Operador ativado! Suas alterações serão enviadas para a nuvem.', 'ok');
              }}
              className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                isOperator
                  ? 'border-emerald-500/80 bg-emerald-500/15 shadow-[0_0_15px_-5px_rgba(16,185,129,0.5)]'
                  : 'border-line/70 bg-ink-900/60 hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <RadioTower size={14} className={isOperator ? 'text-emerald-400' : 'text-zinc-400'} />
                <span>Pessoa Atualizando (Operador)</span>
              </div>
              <span className="mt-1 text-[11px] text-zinc-400">
                Permite clicar nos atletas para avançar, eliminar e enviar ao vivo para todos.
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleOperator(false);
                notify('Modo Espectador ativado! Visualização somente leitura atualizada automaticamente.', 'info');
              }}
              className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                !isOperator
                  ? 'border-sky-500/80 bg-sky-500/15 shadow-[0_0_15px_-5px_rgba(14,165,233,0.5)]'
                  : 'border-line/70 bg-ink-900/60 hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <Eye size={14} className={!isOperator ? 'text-sky-400' : 'text-zinc-400'} />
                <span>Público / Telão (Espectador)</span>
              </div>
              <span className="mt-1 text-[11px] text-zinc-400">
                Apenas recebe e exibe os resultados em tempo real sem risco de cliques acidentais.
              </span>
            </button>
          </div>
        </div>

        {/* Status da Conexão */}
        <div className="flex items-center justify-between rounded-lg border border-line/60 bg-ink-900/60 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <Radio
              size={14}
              className={
                cloudStatus === 'synced'
                  ? 'text-emerald-400 animate-pulse'
                  : cloudStatus === 'syncing'
                    ? 'text-amber-400 animate-spin'
                    : 'text-rose-400'
              }
            />
            <span className="text-xs font-semibold text-zinc-200">
              {cloudStatus === 'synced'
                ? 'Conectado e Sincronizado'
                : cloudStatus === 'syncing'
                  ? 'Sincronizando com a Nuvem...'
                  : 'Aguardando sincronização / Verifique conexão'}
            </span>
          </div>

          {lastSyncTime && (
            <span className="text-[10px] font-mono text-zinc-400">
              Último sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Configuração da URL do Banco Firebase */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-300">
              URL do Banco Firebase Realtime Database
            </label>
            <input
              type="url"
              required
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://seu-banco-rtdb.firebaseio.com/fifa_live_2026.json"
              className="w-full rounded-lg border border-line bg-ink-950 px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-brand focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-zinc-500">
              Banco padrão isolado para o FIFA: <code className="text-amber-400">{DEFAULT_FIFA_CLOUD_URL}</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setInputUrl(DEFAULT_FIFA_CLOUD_URL)}
              className="btn-ghost text-xs"
            >
              <RotateCcw size={12} />
              <span>Restaurar URL Padrão</span>
            </button>

            <button type="submit" className="btn-brand text-xs font-bold">
              Salvar Nova URL
            </button>
          </div>
        </form>

        {/* Ações Manuais de Sincronização */}
        <div className="border-t border-line/60 pt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Ações Rápidas de Sincronização
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handlePull}
              className="btn-ghost text-xs text-sky-300 hover:text-white"
              title="Baixar a versão mais recente salva na nuvem agora"
            >
              <Download size={13} />
              <span>Baixar da Nuvem (Atualizar)</span>
            </button>

            {isOperator && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handlePush}
                className="btn-ghost text-xs text-emerald-300 hover:text-white"
                title="Forçar envio da sua chave atual para todos os espectadores"
              >
                <Upload size={13} />
                <span>Enviar para Nuvem (Forçar)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
