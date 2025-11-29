'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useWalletStore } from '@/store/walletStore';
import { getNetworkById } from '@/lib/networks';
import { formatAddress, formatBalance } from '@/lib/wallet';
import { Transaction } from '@/types';

export default function TransactionList() {
  const { transactions, selectedNetwork, accounts, currentAccountIndex } = useWalletStore();
  const account = accounts[currentAccountIndex];

  const filteredTxs = transactions.filter(tx => tx.networkId === selectedNetwork);

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

  const getTypeIcon = (tx: Transaction) => {
    const isSent = tx.from.toLowerCase() === account?.address.toLowerCase();
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
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Hace unos minutos';
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString();
  };

  if (filteredTxs.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-muted">No hay transacciones recientes</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Actividad Reciente</h3>

      {filteredTxs.map((tx, index) => {
        const network = getNetworkById(tx.networkId);
        const isSent = tx.from.toLowerCase() === account?.address.toLowerCase();

        return (
          <motion.div
            key={tx.hash}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
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
                  href={`${network?.explorerUrl}/tx/${tx.hash}`}
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
    </div>
  );
}
