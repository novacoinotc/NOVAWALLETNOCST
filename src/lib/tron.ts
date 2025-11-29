import { TronWeb } from 'tronweb';
import { mnemonicToSeed } from './wallet';
import { HDKey } from '@scure/bip32';

// TRON usa BIP44 path: m/44'/195'/0'/0/0
const TRON_DERIVATION_PATH = "m/44'/195'/0'/0";

// Crear instancia de TronWeb
function createTronWeb(privateKey?: string): TronWeb {
  const config: any = {
    fullHost: 'https://api.trongrid.io',
    headers: {
      'TRON-PRO-API-KEY': process.env.NEXT_PUBLIC_TRONGRID_API_KEY || '',
    },
  };

  if (privateKey) {
    config.privateKey = privateKey;
  }

  return new TronWeb(config);
}

// Obtener private key de TRON desde mnemonic
export function getTronPrivateKeyFromMnemonic(
  mnemonic: string,
  accountIndex: number = 0
): string {
  const seed = mnemonicToSeed(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const derivedKey = hdKey.derive(`${TRON_DERIVATION_PATH}/${accountIndex}`);

  if (!derivedKey.privateKey) {
    throw new Error('Failed to derive TRON private key');
  }

  return Buffer.from(derivedKey.privateKey).toString('hex');
}

// Obtener direccion de TRON desde private key
export function getTronAddressFromPrivateKey(privateKey: string): string {
  const tronWeb = createTronWeb();
  return tronWeb.address.fromPrivateKey(privateKey);
}

// Obtener direccion de TRON desde mnemonic
export function getTronAddressFromMnemonic(
  mnemonic: string,
  accountIndex: number = 0
): string {
  const privateKey = getTronPrivateKeyFromMnemonic(mnemonic, accountIndex);
  return getTronAddressFromPrivateKey(privateKey);
}

// Crear wallet de TRON desde mnemonic
export function createTronWalletFromMnemonic(
  mnemonic: string,
  accountIndex: number = 0
): { address: string; privateKey: string } {
  const privateKey = getTronPrivateKeyFromMnemonic(mnemonic, accountIndex);
  const address = getTronAddressFromPrivateKey(privateKey);
  return { address, privateKey };
}

// Obtener balance de TRON
export async function getTronBalance(address: string): Promise<string> {
  try {
    const tronWeb = createTronWeb();
    const balance = await tronWeb.trx.getBalance(address);
    // Balance viene en SUN (1 TRX = 1,000,000 SUN)
    return (balance / 1e6).toString();
  } catch (error) {
    console.error('Error getting TRON balance:', error);
    return '0';
  }
}

// Enviar TRX
export async function sendTronTransaction(
  privateKey: string,
  toAddress: string,
  amount: string
): Promise<{ hash: string; success: boolean }> {
  try {
    const tronWeb = createTronWeb(privateKey);
    const fromAddress = tronWeb.address.fromPrivateKey(privateKey);

    // Convertir a SUN (1 TRX = 1,000,000 SUN)
    const amountInSun = Math.floor(parseFloat(amount) * 1e6);

    const transaction = await tronWeb.transactionBuilder.sendTrx(
      toAddress,
      amountInSun,
      fromAddress
    );

    const signedTx = await tronWeb.trx.sign(transaction, privateKey);
    const result = await tronWeb.trx.sendRawTransaction(signedTx);

    return {
      hash: result.txid || result.transaction?.txID || '',
      success: result.result === true,
    };
  } catch (error) {
    console.error('Error sending TRON transaction:', error);
    throw error;
  }
}

// Validar direccion de TRON
export function isValidTronAddress(address: string): boolean {
  try {
    const tronWeb = createTronWeb();
    return tronWeb.isAddress(address);
  } catch {
    return false;
  }
}

// Formatear direccion de TRON
export function formatTronAddress(address: string, chars: number = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Estimar fee de TRON (aproximado)
export async function estimateTronFee(): Promise<string> {
  // TRON usa bandwidth y energy, el fee basico es ~1 TRX para transfers simples
  return '1.0';
}
