'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useWalletStore } from '@/store/walletStore';

interface UnlockPageProps {
  onUnlock: () => void;
}

export default function UnlockPage({ onUnlock }: UnlockPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const { unlock, isLoading, resetWallet } = useWalletStore();

  const handleUnlock = async () => {
    setError(null);

    if (!password) {
      setError('Ingresa tu contrasena');
      return;
    }

    const success = await unlock(password);

    if (success) {
      onUnlock();
    } else {
      setAttempts((prev) => prev + 1);
      setError('Contrasena incorrecta');
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  const handleReset = async () => {
    if (window.confirm('Estas seguro? Se eliminaran todos los datos de la wallet.')) {
      await resetWallet();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 30px rgba(168, 85, 247, 0.5)',
                '0 0 50px rgba(168, 85, 247, 0.8)',
                '0 0 30px rgba(168, 85, 247, 0.5)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6"
          >
            <Lock className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-2">
            <span className="text-primary">Nova</span>
            <span className="text-foreground">Wallet</span>
          </h1>
          <p className="text-muted">Desbloquea tu wallet</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Input
            type="password"
            showPasswordToggle
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ingresa tu contrasena"
            error={error || undefined}
            autoFocus
          />

          {attempts >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-warning font-medium">
                  Multiples intentos fallidos
                </p>
                <p className="text-xs text-muted mt-1">
                  Si olvidaste tu contrasena, puedes restaurar usando tu frase
                  semilla.
                </p>
              </div>
            </motion.div>
          )}

          <Button
            onClick={handleUnlock}
            isLoading={isLoading}
            fullWidth
            size="lg"
          >
            Desbloquear
          </Button>
        </motion.div>

        {/* Reset option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={handleReset}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Olvidaste tu contrasena?
          </button>
        </motion.div>
      </div>
    </div>
  );
}
