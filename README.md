# x402 Payment Protocol Demo

A Next.js application demonstrating the x402 payment protocol for just-in-time USDC payments on Solana blockchain.

## 🚀 What is x402?

x402 is an open payment protocol that enables **just-in-time payments** for digital resources without requiring prior payment relationships or subscriptions. Users pay only when they consume resources (APIs, content, AI services, etc.).

## ✨ Features

- **Just-in-Time Payments**: Pay $0.01 USDC to access protected content
- **Solana Integration**: Direct USDC transfers on Solana mainnet
- **Wallet Support**: Phantom and Solflare wallet integration
- **x402 Protocol**: Uses PayAI's x402 client library for payment selection
- **Real-time Verification**: Instant payment confirmation and content access

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Blockchain**: Solana (USDC payments)
- **Wallets**: Phantom, Solflare
- **Payment Protocol**: x402 (PayAI implementation)
- **UI**: Tailwind CSS, Radix UI components

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Mbdulrohim/x402-payment.git
cd x402-payment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Solana RPC URL
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
# Solana RPC Configuration
NEXT_PUBLIC_QUICK_NODE_HTTPS=https://api.mainnet.solana.com
```

## 💰 How It Works

1. **Request Access**: User clicks "Pay 0.01 USDC via x402"
2. **Payment Requirements**: Server returns 402 Payment Required with x402 payment options
3. **Payment Selection**: Client uses x402 library to select appropriate Solana USDC payment
4. **Transaction Creation**: Manual Solana transaction construction for USDC transfer
5. **Payment Verification**: Server validates payment and grants content access
6. **Success**: User gets access to protected content with transaction links

## 🏗️ Architecture

### Client Side (`src/app/page.tsx`)
- Wallet connection (Phantom/Solflare)
- x402 payment requirement selection
- Manual Solana transaction construction
- Payment verification and UI updates

### Server Side (`src/app/api/protected/route.ts`)
- x402 payment requirement responses (402 status)
- Payment verification (demo implementation)
- Content access control

### Components
- `WalletProvider.tsx`: Solana wallet context
- UI components: Button, Card, Input, Label using Radix UI

## 🔒 Security Notes

- **Demo Implementation**: Uses simplified payment verification for demonstration
- **Production**: Implement proper on-chain transaction verification
- **Environment Variables**: Never commit real RPC URLs or private keys

## 🌐 x402 Ecosystem

This implementation uses:
- **PayAI x402 Library**: `@payai/x402` for payment protocol compliance
- **x402scan**: Ecosystem explorer at [x402scan.com](https://www.x402scan.com/)
- **Solana**: Primary blockchain for fast, low-cost payments

## 📄 API Endpoints

### POST `/api/protected`
- **Purpose**: Protected content access with x402 payment
- **Request**: JSON with access request
- **Response**: 402 Payment Required → Payment Success

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [x402 Protocol](https://www.x402.org/)
- [x402scan Explorer](https://www.x402scan.com/)
- [PayAI](https://payai.io/)
- [Solana](https://solana.com/)
