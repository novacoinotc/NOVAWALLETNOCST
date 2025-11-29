'use client';

import { useState } from 'react';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useWalletStore } from '@/store/walletStore';
import { getNetworkById } from '@/lib/networks';
import { isValidAddress, estimateGas, formatBalance } from '@/lib/wallet';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendModal({ isOpen, onClose }: SendModalProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'sending' | 'success'>(
    'input'
  );
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const {
    accounts,
    currentAccountIndex,
    selectedNetwork,
    sendTransaction,
    isLoading,
  } = useWalletStore();
  const account = accounts[currentAccountIndex];
  const network = getNetworkById(selectedNetwork);
  const balance = account?.balances[selectedNetwork] || '0';

  const handleContinue = async () => {
    setError(null);

    if (!isValidAddress(recipient)) {
      setError('Direccion invalida');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Cantidad invalida');
      return;
    }

    if (amountNum > parseFloat(balance)) {
      setError('Saldo insuficiente');
      return;
    }

    try {
      const gas = await estimateGas(
        account.address,
        recipient,
        amount,
        selectedNetwork
      );
      setGasEstimate(gas.totalCost);
      setStep('confirm');
    } catch {
      setError('Error al estimar gas. Verifica la direccion y cantidad.');
    }
  };

  const handleSend = async () => {
    try {
      setStep('sending');
      const hash = await sendTransaction(recipient, amount);
      setTxHash(hash);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
      setStep('input');
    }
  };

  const handleClose = () => {
    setRecipient('');
    setAmount('');
    setStep('input');
    setGasEstimate(null);
    setError(null);
    setTxHash(null);
    onClose();
  };

  const handleSetMax = () => {
    const maxAmount = Math.max(0, parseFloat(balance) - 0.01).toString();
    setAmount(maxAmount);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Enviar" size="md">
      {step === 'input' && (
        <div className="space-y-4">
          <Input
            label="Direccion del destinatario"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Cantidad</label>
              <button
                onClick={handleSetMax}
                className="text-xs text-primary hover:text-primary-light"
              >
                Max: {formatBalance(balance)} {network?.symbol}
              </button>
            </div>
            <div className="relative">
              <Input
                placeholder="0.00"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                {network?.symbol}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-error text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button onClick={handleContinue} fullWidth size="lg">
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-secondary rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted">Cantidad</span>
              <span className="font-medium">
                {amount} {network?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Destinatario</span>
              <span className="font-mono text-sm">
                {recipient.slice(0, 10)}...{recipient.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Red</span>
              <span>{network?.name}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="text-muted">Gas estimado</span>
              <span className="text-warning">
                ~{gasEstimate} {network?.symbol}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep('input')}
              fullWidth
            >
              Atras
            </Button>
            <Button onClick={handleSend} fullWidth>
              Confirmar
            </Button>
          </div>
        </div>
      )}

      {step === 'sending' && (
        <div className="py-8 text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-lg font-medium">Enviando transaccion...</p>
          <p className="text-sm text-muted mt-2">
            Por favor espera mientras se procesa
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="w-8 h-8 text-success" />
          </div>
          <p className="text-lg font-medium">Transaccion enviada</p>
          <p className="text-sm text-muted mt-2 mb-4">
            Tu transaccion ha sido enviada a la red
          </p>
          {txHash && (
            <a
              href={`${network?.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-light text-sm"
            >
              Ver en explorador
            </a>
          )}
          <Button onClick={handleClose} fullWidth className="mt-4">
            Cerrar
          </Button>
        </div>
      )}
    </Modal>
  );
}
