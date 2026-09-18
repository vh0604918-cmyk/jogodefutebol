import React, { useState } from 'react';
import { Crown, Check, X, Shield, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface OwnerEditModalProps {
  isOpen: boolean;
  currentOwnerName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export const OwnerEditModal: React.FC<OwnerEditModalProps> = ({
  isOpen,
  currentOwnerName,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(currentOwnerName || 'VH');

  if (!isOpen) return null;

  const handleConfirm = () => {
    sound.playClick();
    onSave(name.trim() || 'VH');
    onClose();
  };

  const presets = ['VH', 'VH (vh0604918)', 'Victor Hugo', 'Presidente VH'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-amber-500/40 p-6 shadow-2xl shadow-amber-500/10 space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/40 text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Dono do Jogo
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-xs text-neutral-400">
                Identidade do proprietário oficial do FC Brasil 26
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-300 block">
            Nome do Dono do Jogo:
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome (Ex: VH)"
              maxLength={40}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-amber-300 font-bold placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              autoFocus
            />
          </div>
          <span className="text-[11px] text-neutral-500 block">
            Seu nome aparecerá como Dono Oficial em toda a interface, cabeçalho, créditos e gestão do clube.
          </span>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">
            Sugestões rápidas:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setName(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  name === preset
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            Salvar Dono do Jogo
          </button>
        </div>
      </div>
    </div>
  );
};
