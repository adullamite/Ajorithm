# Ajorithm

> The algorithm for Ajo — blockchain-powered rotating savings groups built on Solana.

![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana)
![Anchor](https://img.shields.io/badge/Anchor-1.0.2-FF6B35?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🌍 The Problem

Every month, millions of people across Africa, Latin America, and Southeast Asia 
pool money together in informal rotating savings groups called:

- **Ajo** (Nigeria/Yoruba)
- **Esusu** (Nigeria/Igbo)  
- **Susu** (Ghana/Caribbean)
- **Tontine** (West Africa/France)

These systems work on **social trust** — but trust breaks down:

- ❌ Organizers disappear with the funds
- ❌ Members miss contributions with no consequence
- ❌ No records, no receipts, no proof
- ❌ Disputes destroy communities
- ❌ No credit history built despite years of reliable saving

**300 million people** rely on these systems with zero financial protection.

---

## The Solution

Ajorithm replaces social trust with **programmable trust.**

A Solana smart contract holds all funds in escrow. No single person 
controls the money. Payouts execute automatically in rotation. 
Every contribution is recorded onchain forever.

---

## 🚀 Live Demo

- **Live App:** https://ajorithm.vercel.app
- **Demo Video:** [Watch on YouTube]
- **Network:** Solana Devnet

---

## 📋 Program Details

| Detail | Value |
|--------|-------|
| Program ID | `DNxjy5KkrdJsuf9NNRMcdEuiuME1yV9Rxb8ETLJyAV9f` |
| Network | Solana Devnet |
| Framework | Anchor 1.0.2 |
| Language | Rust |

### Verify on Solana Explorer
[View Program on Devnet Explorer](https://explorer.solana.com/address/DNxjy5KkrdJsuf9NNRMcdEuiuME1yV9Rxb8ETLJyAV9f?cluster=devnet)

---

## 🛠 How It Works

### 1. Create a Pact
An organizer creates a savings group with:
- Group name
- Fixed contribution amount in SOL
- Maximum members (2-10)
- Payout rotation order

### 2. Members Join
A shareable link is generated. Members join directly from:
- WhatsApp
- Telegram  
- Twitter/X
- Any platform that supports links

No wallet installation required for participants.

### 3. Contribute
Each member contributes their fixed SOL amount directly into 
the smart contract escrow. Funds are locked — no single person 
can access them.

### 4. Receive Payout
When it's your turn in the rotation, the organizer triggers 
the payout. Funds release automatically from escrow directly 
to your wallet.

### 5. Build Reputation
Every on-time contribution updates your onchain reputation score. 
Reliable savers build a verifiable financial history — permanently 
recorded on Solana.

---

##  Smart Contract Architecture

### Instructions

| Instruction | Description |
|-------------|-------------|
| `create_pact` | Initialize a savings group with name, amount, and max members |
| `join_pact` | Add a member to an existing pact |
| `contribute` | Transfer SOL from member wallet to escrow PDA |
| `release_payout` | Transfer accumulated funds to next member in rotation |
| `update_reputation` | Record contribution streak and reliability score |

### Account Structure

**PactState**
```rust
pub struct PactState {
    pub organizer: Pubkey,        // Group creator
    pub name: String,             // Pact name (max 32 chars)
    pub contribution_amount: u64, // Fixed SOL amount per round
    pub max_members: u8,          // Maximum 10 members
    pub current_members: u8,      // Current member count
    pub current_round: u8,        // Active payout round
    pub total_rounds: u8,         // Total rounds = total members
    pub is_active: bool,          // Pact status
    pub members: Vec,     // Member wallet addresses
    pub payout_order: Vec,// Rotation schedule
    pub bump: u8,                 // PDA bump seed
}
```

**ReputationState**
```rust
pub struct ReputationState {
    pub member: Pubkey,              // Member wallet
    pub contributions_made: u16,     // Successful contributions
    pub contributions_missed: u16,   // Missed contributions
    pub streak: u16,                 // Current streak count
    pub bump: u8,                    // PDA bump seed
}
```

### Security Model
- All funds held in **PDA escrow** — no private key controls it
- Only the **organizer** can trigger payouts
- Only **pact members** can contribute
- **Recipient validation** — payout only releases to correct rotation member
- **Input validation** on all amounts, member counts, and names

---

## 🏗 Tech Stack

### Blockchain
- **Solana** — Sub-second finality, $0.00025 per transaction
- **Anchor Framework** — Rust smart contract development
- **SPL Tokens** — Native SOL for contributions

### Frontend
- **React + Vite** — Fast frontend tooling
- **Tailwind CSS** — Utility-first styling
- **Solana Wallet Adapter** — Multi-wallet support
- **Recharts** — TVL and analytics charts
- **Framer Motion** — Smooth animations

### Infrastructure
- **Supabase** — Offchain metadata and user profiles
- **Vercel** — Frontend deployment

---

## ⚙️ Setup Instructions

### Prerequisites

```bash
# Check versions
anchor --version  # 1.0.2
solana --version  # 3.1.14
rustc --version   # 1.75+
node --version    # 18+
```

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ajorithm
cd ajorithm
```

### 2. Install Frontend Dependencies

```bash
npm install --legacy-peer-deps
npm run dev
```

Visit `http://localhost:5173`

### 3. Configure Solana

```bash
solana config set --url devnet
solana airdrop 2  # Get devnet SOL for testing
```

### 4. Build Smart Contract

```bash
cd programs/ajorithm
anchor build
```

### 5. Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

### 6. Run Tests

```bash
anchor test
```

---

## Project Structure
ajorithm/
├── programs/
│   └── ajorithm/
│       └── src/
│           └── lib.rs          # Smart contract (Rust/Anchor)
├── src/
│   ├── components/
│   │   ├── Navigation.tsx      # Sidebar + mobile nav
│   │   ├── PactCard.tsx        # Pact display component
│   │   ├── StatsDashboard.tsx  # TVL and stats
│   │   └── TvlChart.tsx        # Analytics chart
│   ├── pages/
│   │   ├── Index.tsx           # Home dashboard
│   │   ├── CreatePact.tsx      # Create new pact
│   │   └── Profile.tsx         # User profile + reputation
│   └── App.tsx                 # Root component
├── Anchor.toml                 # Anchor configuration
└── package.json

---

## 🗺 Roadmap

The following features are planned for future versions:

### v2 — Automation Layer
- **x402 Payment Protocol** integration for gasless contribution payments
- **GhostWallet** intent engine — automated contributions via natural language rules ("contribute every Friday automatically")
- Scheduled payout automation without manual organizer trigger

### v3 — Reputation & Credit
- **Soulbound NFTs** for contribution milestones
- Onchain credit scoring based on pact history
- Reputation API — third-party lenders and DeFi protocols pay to query member reliability scores via x402 micropayments

### v4 — Social Layer
- **Dialect Blinks** for one-click pact joining from any social platform
- In-pact group chat for member coordination
- WhatsApp/Telegram bot integration for contribution reminders

### v5 — Expanded Finance
- Emergency savings pools
- Goal-based savings pacts
- Multi-token support (USDC, USDT)
- Cross-border pacts with currency conversion
- Cooperative lending against pact reputation

### Long-Term Vision
Ajorithm aims to become the decentralized cooperative banking 
infrastructure for the 300 million people who already trust 
rotating savings — giving them blockchain protection, 
financial history, and access to credit they've never had.

---

## 🏆 Hackathon

Built for **Dev3Pack Global Hackathon 2026**
- Track: Solana / DeFi / Social Finance
- Network: Solana Devnet
- Team: Solo

---

## 📄 License

MIT License — feel free to build on this.

---

## 🙏 Acknowledgments

- Solana Foundation for the infrastructure
- Anchor Framework for making Rust smart contracts approachable
- The millions of Ajo/Esusu participants whose trust inspired this

---

*Built in Abuja, Nigeria. For the people who save together.* 🇳🇬
