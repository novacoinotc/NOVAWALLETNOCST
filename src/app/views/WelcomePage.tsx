'use client';

import { motion } from 'framer-motion';
import { Wallet, Import, Shield, Zap, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface WelcomePageProps {
  onCreateWallet: () => void;
  onImportWallet: () => void;
}

export default function WelcomePage({
  onCreateWallet,
  onImportWallet,
}: WelcomePageProps) {
  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'No Custodial',
      description: 'Tu tienes el control total de tus llaves',
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: 'Multi-Chain',
      description: 'Soporta Ethereum, BSC, Polygon y mas',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Rapida y Segura',
      description: 'Encriptacion de grado militar',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and title */}
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
            className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center mb-6"
          >
            <span className="text-5xl font-bold text-white">N</span>
          </motion.div>

          <h1 className="text-4xl font-bold mb-2">
            <span className="text-primary neon-text">Nova</span>
            <span className="text-foreground">Wallet</span>
          </h1>
          <p className="text-muted">Tu wallet crypto segura y facil de usar</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card padding="sm" className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Button
            onClick={onCreateWallet}
            fullWidth
            size="lg"
            className="flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Crear Nueva Wallet
          </Button>

          <Button
            onClick={onImportWallet}
            variant="outline"
            fullWidth
            size="lg"
            className="flex items-center justify-center gap-2"
          >
            <Import className="w-5 h-5" />
            Importar Wallet Existente
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted"
        >
          Al continuar, aceptas nuestros terminos de servicio y politica de
          privacidad
        </motion.p>
      </div>
    </div>
  );
}
