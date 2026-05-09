import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "DNxjy5KkrdJsuf9NNRMcdEuiuME1yV9Rxb8ETLJyAV9f"
);

export const NETWORK = "devnet";
export const RPC_ENDPOINT = "https://api.devnet.solana.com";

export const LAMPORTS_PER_SOL = 1_000_000_000;

export const truncateAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const lamportsToSol = (lamports: number | bigint): number => {
  return Number(lamports) / LAMPORTS_PER_SOL;
};

export const solToLamports = (sol: number): number => {
  return Math.floor(sol * LAMPORTS_PER_SOL);
};
