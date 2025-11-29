'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SeedPhraseDisplay from '@/components/wallet/SeedPhraseDisplay';
import { useWalletStore } from '@/store/walletStore';
import { validatePasswordStrength } from '@/lib/crypto';

interface CreateWalletPageProps {
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'password' | 'seed' | 'verify';

export default function CreateWalletPage({
  onBack,
  onComplete,
}: CreateWalletPageProps) {
  const [step, setStep] = useState<Step>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyWords, setVerifyWords] = useState<{ index: number; word: string }[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>(['', '', '']);

  const { createWallet, isLoading } = useWalletStore();

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

    try {
      const newMnemonic = await createWallet(password);
      setMnemonic(newMnemonic);

      // Select 3 random words for verification
      const words = newMnemonic.split(' ');
      const indices = [2, 5, 9]; // Words at positions 3, 6, 10
      setVerifyWords(indices.map((i) => ({ index: i, word: words[i] })));

      setStep('seed');
    } catch {
      setError('Error al crear la wallet');
    }
  };

  const handleSeedContinue = () => {
    setStep('verify');
  };

  const handleVerify = () => {
    const isCorrect = verifyWords.every(
      (vw, i) => userInputs[i].toLowerCase().trim() === vw.word
    );

    if (!isCorrect) {
      setError('Las palabras no coinciden. Verifica tu frase semilla.');
      return;
    }

    onComplete();
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={step === 'password' ? onBack : () => setStep('password')}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Crear Wallet</h1>
          <p className="text-sm text-muted">
            {step === 'password' && 'Paso 1: Crear contrasena'}
            {step === 'seed' && 'Paso 2: Guardar frase semilla'}
            {step === 'verify' && 'Paso 3: Verificar frase semilla'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {['password', 'seed', 'verify'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full ${
              ['password', 'seed', 'verify'].indexOf(step) >= i
                ? 'bg-primary'
                : 'bg-secondary'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        {step === 'password' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
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
              Continuar
            </Button>
          </motion.div>
        )}

        {step === 'seed' && mnemonic && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <SeedPhraseDisplay
              mnemonic={mnemonic}
              onContinue={handleSeedContinue}
              showWarning
            />
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <p className="text-muted">
              Para verificar que guardaste tu frase semilla, ingresa las
              siguientes palabras:
            </p>

            <div className="space-y-4">
              {verifyWords.map((vw, i) => (
                <Input
                  key={vw.index}
                  label={`Palabra #${vw.index + 1}`}
                  value={userInputs[i]}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  placeholder={`Ingresa la palabra ${vw.index + 1}`}
                  error={i === verifyWords.length - 1 ? error || undefined : undefined}
                />
              ))}
            </div>

            <Button onClick={handleVerify} fullWidth size="lg">
              Verificar y Continuar
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
