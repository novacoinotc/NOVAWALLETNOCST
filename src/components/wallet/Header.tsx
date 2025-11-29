'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Lock, Menu, X } from 'lucide-react';
import NetworkSelector from './NetworkSelector';
import { useWalletStore } from '@/store/walletStore';

interface HeaderProps {
  onSettings?: () => void;
}

export default function Header({ onSettings }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lock, accounts, currentAccountIndex } = useWalletStore();
  const account = accounts[currentAccountIndex];

  return (
    <header className="sticky top-0 z-30 safe-top">
      <div className="glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-neon">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold">
              <span className="text-primary">Nova</span>
              <span className="text-foreground">Wallet</span>
            </span>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <NetworkSelector />

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors md:hidden"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onSettings}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Settings className="w-5 h-5 text-muted" />
              </button>
              <button
                onClick={lock}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Lock className="w-5 h-5 text-muted" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border"
          >
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  onSettings?.();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <Settings className="w-5 h-5 text-muted" />
                <span>Configuracion</span>
              </button>
              <button
                onClick={() => {
                  lock();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <Lock className="w-5 h-5 text-muted" />
                <span>Bloquear wallet</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
