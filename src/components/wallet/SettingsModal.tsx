'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Shield,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Globe,
  Plus,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SeedPhraseDisplay from './SeedPhraseDisplay';
import { useWalletStore } from '@/store/walletStore';
import Input from '@/components/ui/Input';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsView = 'main' | 'seed' | 'accounts' | 'networks' | 'reset';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [view, setView] = useState<SettingsView>('main');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState('');

  const {
    mnemonic,
    accounts,
    currentAccountIndex,
    addAccount,
    selectAccount,
    resetWallet,
  } = useWalletStore();

  const handleViewSeed = () => {
    if (mnemonic) {
      setView('seed');
    } else {
      setError('Wallet no desbloqueada');
    }
  };

  const handleReset = async () => {
    if (confirmReset.toLowerCase() !== 'eliminar') {
      setError('Escribe "eliminar" para confirmar');
      return;
    }
    await resetWallet();
    onClose();
  };

  const handleClose = () => {
    setView('main');
    setPassword('');
    setError(null);
    setConfirmReset('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        view === 'main'
          ? 'Configuracion'
          : view === 'seed'
          ? 'Frase Semilla'
          : view === 'accounts'
          ? 'Cuentas'
          : view === 'networks'
          ? 'Redes'
          : 'Eliminar Wallet'
      }
      size="md"
    >
      {view === 'main' && (
        <div className="space-y-2">
          <button
            onClick={handleViewSeed}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Ver frase semilla</p>
                <p className="text-sm text-muted">
                  Respalda tu wallet
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted" />
          </button>

          <button
            onClick={() => setView('accounts')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Gestionar cuentas</p>
                <p className="text-sm text-muted">
                  {accounts.length} cuenta{accounts.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted" />
          </button>

          <button
            onClick={() => setView('reset')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-error/10 hover:bg-error/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-error" />
              <div className="text-left">
                <p className="font-medium text-error">Eliminar wallet</p>
                <p className="text-sm text-muted">
                  Eliminar todos los datos
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-error" />
          </button>
        </div>
      )}

      {view === 'seed' && mnemonic && (
        <div>
          <SeedPhraseDisplay mnemonic={mnemonic} showWarning />
          <Button
            variant="secondary"
            onClick={() => setView('main')}
            fullWidth
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      )}

      {view === 'accounts' && (
        <div className="space-y-4">
          {accounts.map((account, index) => (
            <motion.div
              key={account.address}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                hoverable
                padding="sm"
                className={
                  currentAccountIndex === index ? 'border-primary' : ''
                }
                onClick={() => selectAccount(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted font-mono">
                      {account.address.slice(0, 10)}...
                      {account.address.slice(-8)}
                    </p>
                  </div>
                  {currentAccountIndex === index && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}

          <Button
            variant="outline"
            onClick={addAccount}
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar cuenta
          </Button>

          <Button
            variant="secondary"
            onClick={() => setView('main')}
            fullWidth
          >
            Volver
          </Button>
        </div>
      )}

      {view === 'reset' && (
        <div className="space-y-4">
          <Card variant="glass" className="border-error/30">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-error">Advertencia</p>
                <p className="text-sm text-muted">
                  Esta accion eliminara permanentemente tu wallet de este
                  dispositivo. Asegurate de tener respaldada tu frase semilla
                  antes de continuar.
                </p>
              </div>
            </div>
          </Card>

          <Input
            label='Escribe "eliminar" para confirmar'
            value={confirmReset}
            onChange={(e) => setConfirmReset(e.target.value)}
            error={error || undefined}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setView('main')}
              fullWidth
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleReset} fullWidth>
              Eliminar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
