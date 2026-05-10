# Ajorithm 🔄

> The algorithm for Ajo — blockchain-powered rotating savings groups built on Solana.

![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana)
![Anchor](https://img.shields.io/badge/Anchor-1.0.2-FF6B35?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## The Problem

Every month, hundreds of millions of people across Africa pool money together in informal rotating savings groups called:

- **Ajo** (Nigeria/Yoruba)
- **Esusu** (Nigeria/Igbo)
- **Susu** (Ghana/Caribbean)
- **Tontine** (West Africa)
- **Tandas** (Mexico/LATAM)

These systems work on social trust — but trust breaks down. Organizers disappear with funds. No records. No receipts. No proof. **300 million people** rely on these systems with zero financial protection.

---

## ✅ The Solution

Ajorithm replaces social trust with **programmable trust**.

- A Solana smart contract holds all funds in PDA escrow
- No single person controls the money. Ever.
- Payouts execute in rotation automatically
- Every contribution is recorded on-chain forever
- Reputation builds with every successful round

---

##  Live Demo

| | |
|---|---|
| **App** | https://ajorithm.vercel.app |
| **Network** | Solana Devnet |
| **Program ID** | `DNxjy5KkrdJsuf9NNRMcdEuiuME1yV9Rxb8ETLJyAV9f` |
| **GitHub** | https://github.com/adullamite/Ajorithm |
| **Explorer** | [View on Solana Explorer](https://explorer.solana.com/address/DNxjy5KkrdJsuf9NNRMcdEuiuME1yV9Rxb8ETLJyAV9f?cluster=devnet) |

---

## Program Details

| Detail | Value |
|--------|-------|
| Program ID | `DNxjy5KkrdJsuf9NNRMcdEuiuME1yV9Rxb8ETLJyAV9f` |
| Network | Solana Devnet |
| Framework | Anchor 1.0.2 |
| Language | Rust |
| Wallet | `Hcjn9vM1sLwsAPQi3v7S1B5BP19XoUy5TJr5FuG1Lpkb` |

---

##  How It Works

### Step 1 — Organizer Creates Pact
An organizer creates a savings group with a name, fixed contribution amount in SOL, and maximum members (2–10). The smart contract initializes a PDA account storing all pact data on-chain.

### Step 2 — Members Join
A shareable invite link (Blink) is generated. Members join directly from WhatsApp, Telegram, X/Twitter, or any platform that supports links.

### Step 3 — Contribute
Each member contributes their fixed SOL amount directly into the smart contract escrow PDA. Funds are locked — no single person can access them outside the contract rules.

### Step 4 — Receive Payout
When it is your turn in the rotation, the organizer triggers the payout. Funds release automatically from escrow directly to the correct wallet. Wrong recipient is rejected by the contract.

### Step 5 — Build Reputation
Every on-time contribution updates your on-chain reputation score. Reliable savers build a verifiable financial history permanently recorded on Solana.

---

## Smart Contract Architecture

### Instructions

| Instruction | Description |
|-------------|-------------|
| `create_pact` | Initialize a savings group with name, amount, and max members |
| `join_pact` | Add a member to an existing pact |
| `contribute` | Transfer SOL from member wallet to escrow PDA |
| `release_payout` | Send accumulated funds to next member in rotation |
| `update_reputation` | Record contribution streak and reliability score |

### Account Structure

**PactState** stores all pact data on-chain:

| Field | Type | Description |
|-------|------|-------------|
| `organizer` | Pubkey | Group creator |
| `name` | String | Pact name (max 32 chars) |
| `contribution_amount` | u64 | Fixed SOL amount per round |
| `max_members` | u8 | Maximum 10 members |
| `current_members` | u8 | Current member count |
| `current_round` | u8 | Active payout round |
| `total_rounds` | u8 | Total rounds = total members |
| `is_active` | bool | Pact status |
| `members` | Vec\<Pubkey\> | Member wallet addresses |
| `payout_order` | Vec\<Pubkey\> | Rotation schedule |
| `bump` | u8 | PDA bump seed |

**ReputationState** stores per-member history:

| Field | Type | Description |
|-------|------|-------------|
| `member` | Pubkey | Member wallet |
| `contributions_made` | u16 | Successful contributions |
| `contributions_missed` | u16 | Missed contributions |
| `streak` | u16 | Current streak count |
| `bump` | u8 | PDA bump seed |

### PDA Seeds

```
Pact PDA:       seeds = [b"pact", organizer.key, name.as_bytes]
Reputation PDA: seeds = [b"reputation", member.key, pact.key]
Escrow PDA:     seeds = [b"escrow", pact.key]
```

### Error Codes

| Code | Name | Message |
|------|------|---------|
| 6000 | `NameTooLong` | Pact name must be 32 characters or less |
| 6001 | `InvalidMemberCount` | Member count must be between 2 and 10 |
| 6002 | `InvalidAmount` | Contribution amount must be greater than zero |
| 6003 | `PactNotActive` | Pact is not active |
| 6004 | `PactFull` | Pact is full |
| 6005 | `AlreadyMember` | Already a member of this pact |
| 6006 | `NotAMember` | Not a member of this pact |
| 6007 | `NotOrganizer` | Only the organizer can trigger payouts |
| 6008 | `AllRoundsComplete` | All rounds are complete |
| 6009 | `WrongRecipient` | Wrong recipient for this round |
| 6010 | `InsufficientFunds` | Insufficient funds in escrow |

---

## 🛠️ Tech Stack

### Blockchain
- **Solana** — sub-second finality, <$0.001 per transaction
- **Anchor 1.0.2** — Rust smart contract framework
- **Native SOL** — contributions and payouts (USDC in Phase 2)

### Frontend
- **React 18 + Vite** — fast frontend tooling
- **Tailwind CSS** — glassmorphism design system
- **@solana/wallet-adapter-react** — Phantom + Backpack support
- **@coral-xyz/anchor** — contract SDK
- **Vercel** — deployment

---

##  Project Structure

```
ajorithm/
├── programs/
│   └── ajorithm/
│       └── src/
│           └── lib.rs              Smart contract (Rust/Anchor)
├── src/
│   ├── components/
│   │   ├── AppLayout.tsx
│   │   ├── BlinkCard.tsx
│   │   ├── BottomNav.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── ContributionTimeline.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── GlassCard.tsx
│   │   ├── PactCard.tsx
│   │   ├── ReputationBadge.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Skeleton.tsx
│   │   └── TransactionLoader.tsx
│   ├── hooks/
│   │   ├── useAjorithm.ts
│   │   └── use-toast.ts
│   ├── idl/
│   │   └── ajorithmIDL.json
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── CreatePact.tsx
│   │   ├── PactDetail.tsx
│   │   ├── Profile.tsx
│   │   ├── JoinPact.tsx
│   │   └── NotFound.tsx
│   └── App.tsx
├── Anchor.toml
├── Cargo.toml
└── package.json
```

---

##  Setup & Installation

### Prerequisites

```
Node.js     v22+
Rust        1.75.0+
Solana CLI  3.1.14+
Anchor CLI  1.0.2
```

### 1 — Clone

```bash
git clone https://github.com/adullamite/Ajorithm
cd ajorithm
```

### 2 — Install Dependencies

```bash
npm install
```

### 3 — Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

### 4 — Configure Solana

```bash
solana config set --url devnet
solana airdrop 2
```

### 5 — Build Smart Contract

```bash
anchor build
```

### 6 — Deploy to Devnet

```bash
anchor program deploy
```

---

## Environment Variables

Create a `.env` file in the project root:

```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=DNxjy5KkrdJsuf9NNRMcdEuiuME1yV9Rxb8ETLJyAV9f
NEXT_PUBLIC_NETWORK=devnet
```

---

## Security Model

- All funds held in PDA escrow — no private key controls it
- Only the organizer can trigger payouts
- Only pact members can contribute
- Recipient validation — payout only releases to correct rotation member
- No off-chain storage for financial state — everything on-chain and auditable
- All transactions require explicit wallet signature

---

##  Roadmap

### Phase 1 — MVP ✅ (Complete)
- Rust/Anchor smart contract live on Solana Devnet
- Web frontend with full pact lifecycle
- Blink social sharing integration
- GitHub repo with full documentation

### Phase 2 — Stability (Q3 2026)
- USDC contribution support
- Mainnet deployment
- Automated round scheduling
- Android app on Solana dApp Store

### Phase 3 — Ecosystem (Q4 2026)
- PajCash token integration
- iOS application
- Credit scoring API based on ReputationState
- DAO governance

### Phase 4 — Scale (2027)
- Institutional pacts for cooperatives
- Multi-chain expansion
- Fiat on-ramp for non-crypto users
- Ajorithm SDK

---

## Team

| Name | Role |
|------|------|
| Moses Onuh Abuh | Lead Developer & Founder |
| Zulhijjah Abdulmumin | Co-Developer |
| [TBC] | Team Member |
| [TBC] | Team Member |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License — free to use, modify, and distribute.

---

> Built in Abuja, Nigeria. For the people who save together. 🇳🇬