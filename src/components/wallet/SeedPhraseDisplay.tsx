'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface SeedPhraseDisplayProps {
  mnemonic: string;
  onContinue?: () => void;
  showWarning?: boolean;
}

export default function SeedPhraseDisplay({
  mnemonic,
  onContinue,
  showWarning = true,
}: SeedPhraseDisplayProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const words = mnemonic.split(' ');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {showWarning && (
        <Card variant="glass" className="border-warning/30">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-warning">Importante</p>
              <p className="text-sm text-muted">
                Guarda estas 12 palabras en un lugar seguro. Son la unica forma
                de recuperar tu wallet. Nunca las compartas con nadie.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card variant="neon" className="relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Frase Semilla</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsRevealed(!isRevealed)}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {isRevealed ? (
                <EyeOff className="w-4 h-4 text-muted" />
              ) : (
                <Eye className="w-4 h-4 text-muted" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {words.map((word, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2"
            >
              <span className="text-xs text-muted w-5">{index + 1}.</span>
              <span
                className={`text-sm font-medium ${
                  isRevealed ? 'text-foreground' : 'blur-sm select-none'
                }`}
              >
                {word}
              </span>
            </motion.div>
          ))}
        </div>

        {!isRevealed && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsRevealed(true)}
          >
            <div className="text-center">
              <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted">Click para revelar</p>
            </div>
          </div>
        )}
      </Card>

      {onContinue && (
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted">
              He guardado mi frase semilla en un lugar seguro y entiendo que
              perderla significa perder acceso permanente a mis fondos.
            </span>
          </label>

          <Button
            onClick={onContinue}
            disabled={!confirmed}
            fullWidth
            size="lg"
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
}
