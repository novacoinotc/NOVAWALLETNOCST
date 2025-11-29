'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/store/walletStore';

// Pages/Views
import WelcomePage from './views/WelcomePage';
import CreateWalletPage from './views/CreateWalletPage';
import ImportWalletPage from './views/ImportWalletPage';
import UnlockPage from './views/UnlockPage';
import DashboardPage from './views/DashboardPage';
import LoadingScreen from './views/LoadingScreen';

export default function Home() {
  const { isInitialized, isUnlocked, isLoading, initialize } = useWalletStore();
  const [view, setView] = useState<'welcome' | 'create' | 'import' | 'unlock' | 'dashboard'>('welcome');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      if (isUnlocked) {
        setView('dashboard');
      } else if (isInitialized) {
        setView('unlock');
      } else {
        setView('welcome');
      }
    }
  }, [isLoading, isInitialized, isUnlocked]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WelcomePage
              onCreateWallet={() => setView('create')}
              onImportWallet={() => setView('import')}
            />
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <CreateWalletPage
              onBack={() => setView('welcome')}
              onComplete={() => setView('dashboard')}
            />
          </motion.div>
        )}

        {view === 'import' && (
          <motion.div
            key="import"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ImportWalletPage
              onBack={() => setView('welcome')}
              onComplete={() => setView('dashboard')}
            />
          </motion.div>
        )}

        {view === 'unlock' && (
          <motion.div
            key="unlock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UnlockPage onUnlock={() => setView('dashboard')} />
          </motion.div>
        )}

        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DashboardPage />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
