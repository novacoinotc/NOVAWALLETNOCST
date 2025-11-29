'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Share2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useWalletStore } from '@/store/walletStore';
import { getNetworkById } from '@/lib/networks';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);
  const { accounts, currentAccountIndex, selectedNetwork } = useWalletStore();
  const account = accounts[currentAccountIndex];
  const network = getNetworkById(selectedNetwork);

  const handleCopy = async () => {
    if (account) {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (account && navigator.share) {
      try {
        await navigator.share({
          title: 'Mi direccion de wallet',
          text: account.address,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  if (!account) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recibir" size="sm">
      <div className="flex flex-col items-center">
        {/* QR Code */}
        <div className="bg-white p-4 rounded-2xl mb-4">
          <QRCodeSVG
            value={account.address}
            size={200}
            level="H"
            includeMargin={false}
            fgColor="#0a0a0f"
            bgColor="#ffffff"
          />
        </div>

        {/* Network badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: network?.iconColor }}
          />
          <span className="text-sm">{network?.name}</span>
        </div>

        {/* Address */}
        <div className="w-full bg-secondary rounded-xl p-3 mb-4">
          <p className="text-xs text-muted mb-1">Tu direccion</p>
          <p className="text-sm font-mono break-all">{account.address}</p>
        </div>

        {/* Warning */}
        <p className="text-xs text-muted text-center mb-4">
          Solo envia {network?.symbol} y tokens compatibles con{' '}
          {network?.name} a esta direccion
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            onClick={handleCopy}
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>
          {'share' in navigator && (
            <Button
              variant="outline"
              onClick={handleShare}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
