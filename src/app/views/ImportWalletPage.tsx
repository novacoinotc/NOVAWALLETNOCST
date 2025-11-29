'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SeedPhraseInput from '@/components/wallet/SeedPhraseInput';
import { useWalletStore } from '@/store/walletStore';
import { validatePasswordStrength } from '@/lib/crypto';

interface ImportWalletPageProps {
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'seed' | 'password';

export default function ImportWalletPage({
  onBack,
  onComplete,
}: ImportWalletPageProps) {
  const [step, setStep] = useState<Step>('seed');
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { importWallet, isLoading } = useWalletStore();

  const handleSeedSubmit = (seed: string) => {
    setMnemonic(seed);
    setStep('password');
  };

  const handlePasswordSubmit = async () => {
    setError(null);

    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    if (!mnemonic) {
      setError('Frase semilla no encontrada');
      return;
    }

    try {
      await importWallet(mnemonic, password);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar la wallet');
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={step === 'seed' ? onBack : () => setStep('seed')}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Importar Wallet</h1>
          <p className="text-sm text-muted">
            {step === 'seed' && 'Paso 1: Ingresar frase semilla'}
            {step === 'password' && 'Paso 2: Crear contrasena'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {['seed', 'password'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full ${
              ['seed', 'password'].indexOf(step) >= i
                ? 'bg-primary'
                : 'bg-secondary'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        {step === 'seed' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <SeedPhraseInput onSubmit={handleSeedSubmit} isLoading={isLoading} />
          </motion.div>
        )}

        {step === 'password' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <p className="text-muted">
              Crea una contrasena para proteger tu wallet en este dispositivo.
            </p>

            <div className="space-y-4">
              <Input
                label="Contrasena"
                type="password"
                showPasswordToggle
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caracteres"
                helperText="Usa mayusculas, minusculas y numeros"
              />

              <Input
                label="Confirmar contrasena"
                type="password"
                showPasswordToggle
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contrasena"
                error={error || undefined}
              />
            </div>

            {/* Password requirements */}
            <div className="space-y-2">
              <p className="text-sm text-muted">Requisitos:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { check: password.length >= 8, text: '8+ caracteres' },
                  { check: /[A-Z]/.test(password), text: 'Una mayuscula' },
                  { check: /[a-z]/.test(password), text: 'Una minuscula' },
                  { check: /[0-9]/.test(password), text: 'Un numero' },
                ].map((req) => (
                  <div
                    key={req.text}
                    className={`flex items-center gap-2 text-sm ${
                      req.check ? 'text-success' : 'text-muted'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    {req.text}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handlePasswordSubmit}
              isLoading={isLoading}
              fullWidth
              size="lg"
            >
              Importar Wallet
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
