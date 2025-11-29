# Nova Wallet

Una wallet de criptomonedas no custodial, segura y facil de usar.

## Caracteristicas

- **No Custodial**: Tu tienes el control total de tus llaves privadas
- **Multi-Chain**: Soporta multiples redes:
  - Ethereum
  - BNB Smart Chain
  - Polygon
  - Arbitrum
  - Optimism
  - Avalanche
  - Base
  - zkSync Era
  - Fantom
  - Linea
  - Y mas...
- **Frase Semilla BIP39**: Generacion y recuperacion estandar de 12 palabras
- **Derivacion HD (BIP44)**: Multiples cuentas desde una sola frase semilla
- **Encriptacion Segura**: Tus datos estan protegidos con encriptacion AES-256
- **Diseno Moderno**: Interfaz minimalista con tema morado neon

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Crypto**: ethers.js, bip39, @scure/bip32
- **Animations**: Framer Motion
- **Mobile**: Capacitor (Android/iOS)

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/nova-wallet.git
cd nova-wallet

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Produccion
npm run build        # Compilar para produccion
npm run start        # Iniciar servidor de produccion

# Mobile (Capacitor)
npm run build:android   # Compilar para Android
npm run build:ios       # Compilar para iOS
npm run android         # Abrir proyecto en Android Studio
npm run ios             # Abrir proyecto en Xcode
npm run cap:sync        # Sincronizar cambios web con mobile
```

## Deploy en Vercel

1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Configura el proyecto:
   - Build Command: `npm run build`
   - Output Directory: `out`
   - Framework Preset: `Next.js`
3. Deploy!

## Generar APK (Android)

```bash
# 1. Compilar el proyecto web
npm run build

# 2. Agregar plataforma Android (solo la primera vez)
npm run cap:add:android

# 3. Sincronizar y abrir en Android Studio
npm run build:android
npm run android

# 4. En Android Studio: Build > Generate Signed Bundle/APK
```

## Generar App iOS

```bash
# 1. Compilar el proyecto web
npm run build

# 2. Agregar plataforma iOS (solo la primera vez)
npm run cap:add:ios

# 3. Sincronizar y abrir en Xcode
npm run build:ios
npm run ios

# 4. En Xcode: Product > Archive
```

## Estructura del Proyecto

```
nova-wallet/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── views/          # Vistas principales
│   │   ├── layout.tsx      # Layout principal
│   │   ├── page.tsx        # Pagina principal
│   │   └── globals.css     # Estilos globales
│   ├── components/
│   │   ├── ui/             # Componentes UI reutilizables
│   │   └── wallet/         # Componentes especificos de wallet
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilidades y logica core
│   │   ├── crypto.ts       # Encriptacion/desencriptacion
│   │   ├── networks.ts     # Configuracion de redes
│   │   ├── storage.ts      # Almacenamiento local
│   │   └── wallet.ts       # Operaciones de wallet
│   ├── store/              # Estado global (Zustand)
│   └── types/              # Tipos TypeScript
├── public/                 # Assets estaticos
├── capacitor.config.ts     # Configuracion Capacitor
├── next.config.ts          # Configuracion Next.js
└── package.json
```

## Seguridad

- Las llaves privadas **nunca** salen de tu dispositivo
- La frase semilla se encripta con AES-256-CBC antes de almacenarse
- La contrasena se deriva usando PBKDF2 con 100,000 iteraciones
- Todo el almacenamiento es local (localStorage/Capacitor Preferences)

## Redes Soportadas

| Red | Chain ID | Simbolo |
|-----|----------|---------|
| Ethereum | 1 | ETH |
| BNB Smart Chain | 56 | BNB |
| Polygon | 137 | MATIC |
| Arbitrum One | 42161 | ETH |
| Optimism | 10 | ETH |
| Avalanche C-Chain | 43114 | AVAX |
| Base | 8453 | ETH |
| zkSync Era | 324 | ETH |
| Fantom Opera | 250 | FTM |
| Linea | 59144 | ETH |
| Sepolia (Testnet) | 11155111 | ETH |
| BSC Testnet | 97 | tBNB |

## Proximas Funcionalidades

- [ ] Comprar crypto con tarjeta
- [ ] Swap de tokens integrado
- [ ] Bridge entre redes
- [ ] Soporte para NFTs
- [ ] Soporte para tokens ERC-20
- [ ] WalletConnect
- [ ] Historial de precios

## Licencia

MIT License

## Advertencia

Este software se proporciona "tal cual". Siempre verifica las direcciones antes de enviar transacciones y guarda tu frase semilla de forma segura. Nunca compartas tu frase semilla con nadie.
