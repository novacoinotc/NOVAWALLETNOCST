'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clipboard } from 'lucide-react';
import Button from '@/components/ui/Button';
import { validateMnemonic } from '@/lib/wallet';

interface SeedPhraseInputProps {
  onSubmit: (mnemonic: string) => void;
  isLoading?: boolean;
}

export default function SeedPhraseInput({
  onSubmit,
  isLoading = false,
}: SeedPhraseInputProps) {
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];

    // Handle paste of multiple words
    if (value.includes(' ')) {
      const pastedWords = value.trim().split(/\s+/);
      pastedWords.forEach((word, i) => {
        if (index + i < 12) {
          newWords[index + i] = word.toLowerCase();
        }
      });
      setWords(newWords);

      // Focus next empty input or last input
      const nextEmptyIndex = newWords.findIndex((w, i) => i >= index && w === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[11]?.focus();
      }
    } else {
      newWords[index] = value.toLowerCase().trim();
      setWords(newWords);
    }

    setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
      if (e.key !== 'Tab') e.preventDefault();
      if (index < 11) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === 'Backspace' && words[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const pastedWords = text.trim().split(/\s+/).slice(0, 12);

      if (pastedWords.length === 12) {
        setWords(pastedWords.map(w => w.toLowerCase()));
        setError(null);
      } else {
        setError('La frase semilla debe contener 12 palabras');
      }
    } catch {
      setError('No se pudo acceder al portapapeles');
    }
  };

  const handleSubmit = () => {
    const mnemonic = words.join(' ').trim();

    if (words.some(w => w === '')) {
      setError('Por favor completa todas las palabras');
      return;
    }

    if (!validateMnemonic(mnemonic)) {
      setError('Frase semilla invalida');
      return;
    }

    onSubmit(mnemonic);
  };

  const isComplete = words.every(w => w !== '');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted">
          Ingresa tu frase semilla de 12 palabras
        </p>
        <button
          onClick={handlePasteFromClipboard}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
        >
          <Clipboard className="w-4 h-4" />
          Pegar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {words.map((word, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="relative"
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
              {index + 1}.
            </span>
            <input
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              value={word}
              onChange={(e) => handleWordChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-full pl-8 pr-2 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </motion.div>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-error text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!isComplete}
        isLoading={isLoading}
        fullWidth
        size="lg"
      >
        Importar Wallet
      </Button>
    </div>
  );
}
