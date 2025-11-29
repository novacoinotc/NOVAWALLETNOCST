import CryptoJS from 'crypto-js';
import { EncryptedVault } from '@/types';

const VAULT_VERSION = 1;
const KEY_SIZE = 256;
const ITERATIONS = 100000;

export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
}

export function generateIv(): string {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
}

function deriveKey(password: string, salt: string): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS,
  });
}

export function encryptMnemonic(mnemonic: string, password: string): EncryptedVault {
  const salt = generateSalt();
  const iv = generateIv();
  const key = deriveKey(password, salt);

  const encrypted = CryptoJS.AES.encrypt(mnemonic, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    encryptedMnemonic: encrypted.toString(),
    salt,
    iv,
    version: VAULT_VERSION,
  };
}

export function decryptMnemonic(vault: EncryptedVault, password: string): string | null {
  try {
    const key = deriveKey(password, vault.salt);

    const decrypted = CryptoJS.AES.decrypt(vault.encryptedMnemonic, key, {
      iv: CryptoJS.enc.Hex.parse(vault.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const mnemonic = decrypted.toString(CryptoJS.enc.Utf8);

    if (!mnemonic) {
      return null;
    }

    return mnemonic;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contrasena debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayuscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minuscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un numero');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
