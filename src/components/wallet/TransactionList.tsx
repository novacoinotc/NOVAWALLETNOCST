'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useWalletStore } from '@/store/walletStore';
import { getNetworkById, isTronNetwork } from '@/lib/networks';
import { formatAddress, formatBalance } from '@/lib/wallet';
import { Transaction } from '@/types';

export default function TransactionList() {
  const {
    transactions,
    selectedNetwork,
    accounts,
    currentAccountIndex,
    isLoadingTx,
    refreshTransactions
  } = useWalletStore();
  const account = accounts[currentAccountIndex];

  const filteredTxs = transactions.filter(tx => tx.networkId === selectedNetwork);

  // Cargar transacciones al montar el componente
  useEffect(() => {
    refreshTransactions();
  }, [selectedNetwork, currentAccountIndex]);

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-warning animate-pulse" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-error" />;
    }
  };

  const isSentTransaction = (tx: Transaction) => {
    if (!account) return false;

    // Para TRON, comparar con tronAddress
    if (isTronNetwork(tx.networkId)) {
      return tx.from.toLowerCase() === account.tronAddress?.toLowerCase();
    }

    // Para EVM, comparar con address
    return tx.from.toLowerCase() === account.address.toLowerCase();
  };

  const getTypeIcon = (tx: Transaction) => {
    const isSent = isSentTransaction(tx);
    return isSent ? (
      <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
        <ArrowUpRight className="w-5 h-5 text-error" />
      </div>
    ) : (
      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
        <ArrowDownLeft className="w-5 h-5 text-success" />
      </div>
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString();
  };

  const getExplorerUrl = (tx: Transaction) => {
    const network = getNetworkById(tx.networkId);
    if (!network) return '#';

    // TRON usa formato diferente
    if (isTronNetwork(tx.networkId)) {
      return `${network.explorerUrl}/#/transaction/${tx.hash}`;
    }

    return `${network.explorerUrl}/tx/${tx.hash}`;
  };

  if (isLoadingTx && filteredTxs.length === 0) {
    return (
      <Card className="text-center py-8">
        <Loader2 className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
        <p className="text-muted">Cargando transacciones...</p>
      </Card>
    );
  }

  if (filteredTxs.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Actividad Reciente</h3>
          <button
            onClick={() => refreshTransactions()}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            disabled={isLoadingTx}
          >
            <RefreshCw className={`w-4 h-4 text-muted ${isLoadingTx ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <Card className="text-center py-8">
          <p className="text-muted">No hay transacciones recientes</p>
          <p className="text-xs text-muted mt-2">
            Las transacciones apareceran aqui cuando envies o recibas fondos
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Actividad Reciente</h3>
        <button
          onClick={() => refreshTransactions()}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          disabled={isLoadingTx}
        >
          <RefreshCw className={`w-4 h-4 text-muted ${isLoadingTx ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {filteredTxs.slice(0, 20).map((tx, index) => {
        const network = getNetworkById(tx.networkId);
        const isSent = isSentTransaction(tx);

        return (
          <motion.div
            key={tx.hash}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card hoverable padding="sm">
              <div className="flex items-center gap-3">
                {getTypeIcon(tx)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {isSent ? 'Enviado' : 'Recibido'}
                    </p>
                    {getStatusIcon(tx.status)}
                  </div>
                  <p className="text-sm text-muted truncate">
                    {isSent ? `A: ${formatAddress(tx.to)}` : `De: ${formatAddress(tx.from)}`}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`font-medium ${isSent ? 'text-error' : 'text-success'}`}>
                    {isSent ? '-' : '+'}{formatBalance(tx.value)} {network?.symbol}
                  </p>
                  <p className="text-xs text-muted">{formatDate(tx.timestamp)}</p>
                </div>

                <a
                  href={getExplorerUrl(tx)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 text-muted" />
                </a>
              </div>
            </Card>
          </motion.div>
        );
      })}

      {filteredTxs.length > 20 && (
        <p className="text-center text-sm text-muted">
          Mostrando las ultimas 20 transacciones
        </p>
      )}
    </div>
  );
}
