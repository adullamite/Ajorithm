import { useCallback, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getProgram, getPactPDA, getEscrowPDA, getReputationPDA } from "@/lib/anchorProvider";
import { PROGRAM_ID, solToLamports } from "@/lib/constants";

export interface PactAccount {
  publicKey: PublicKey;
  organizer: PublicKey;
  name: string;
  contributionAmount: BN;
  maxMembers: number;
  currentMembers: number;
  currentRound: number;
  totalRounds: number;
  isActive: boolean;
  members: PublicKey[];
  payoutOrder: PublicKey[];
  bump: number;
}

export interface ReputationAccount {
  member: PublicKey;
  contributionsMade: number;
  contributionsMissed: number;
  streak: number;
  bump: number;
}

export function useAjorithm() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPact = useCallback(
    async (name: string, contributionAmountSol: number, maxMembers: number) => {
      if (!wallet) throw new Error("Wallet not connected");
      setLoading(true);
      setError(null);
      try {
        const program = getProgram(wallet);
        const [pactPDA] = getPactPDA(wallet.publicKey, name);
        const [escrowPDA] = getEscrowPDA(pactPDA);
        const [reputationPDA] = getReputationPDA(wallet.publicKey, pactPDA);
        const lamports = new BN(solToLamports(contributionAmountSol));

        const tx = await program.methods
          .createPact(name, lamports, maxMembers)
          .accounts({
            pact: pactPDA,
            organizerReputation: reputationPDA,
            escrow: escrowPDA,
            organizer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return { tx, pactAddress: pactPDA.toBase58() };
      } catch (e: any) {
        setError(e.message || "Failed to create pact");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [wallet]
  );

  const joinPact = useCallback(
    async (pactAddress: string) => {
      if (!wallet) throw new Error("Wallet not connected");
      setLoading(true);
      setError(null);
      try {
        const program = getProgram(wallet);
        const pactPubkey = new PublicKey(pactAddress);
        const [reputationPDA] = getReputationPDA(wallet.publicKey, pactPubkey);

        const tx = await program.methods
          .joinPact()
          .accounts({
            pact: pactPubkey,
            memberReputation: reputationPDA,
            member: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return { tx };
      } catch (e: any) {
        setError(e.message || "Failed to join pact");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [wallet]
  );

  const contribute = useCallback(
    async (pactAddress: string) => {
      if (!wallet) throw new Error("Wallet not connected");
      setLoading(true);
      setError(null);
      try {
        const program = getProgram(wallet);
        const pactPubkey = new PublicKey(pactAddress);
        const [escrowPDA] = getEscrowPDA(pactPubkey);
        const [reputationPDA] = getReputationPDA(wallet.publicKey, pactPubkey);

        const tx = await program.methods
          .contribute()
          .accounts({
            pact: pactPubkey,
            memberReputation: reputationPDA,
            escrow: escrowPDA,
            member: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return { tx };
      } catch (e: any) {
        setError(e.message || "Failed to contribute");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [wallet]
  );

  const releasePayout = useCallback(
    async (pactAddress: string, recipientAddress: string) => {
      if (!wallet) throw new Error("Wallet not connected");
      setLoading(true);
      setError(null);
      try {
        const program = getProgram(wallet);
        const pactPubkey = new PublicKey(pactAddress);
        const [escrowPDA] = getEscrowPDA(pactPubkey);

        const tx = await program.methods
          .releasePayout()
          .accounts({
            pact: pactPubkey,
            escrow: escrowPDA,
            recipient: new PublicKey(recipientAddress),
            organizer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return { tx };
      } catch (e: any) {
        setError(e.message || "Failed to release payout");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [wallet]
  );

  const fetchAllPacts = useCallback(async (): Promise<PactAccount[]> => {
    try {
      const program = getProgram(wallet!);
      const accounts = await (program.account as any).pactState.all();
      return accounts.map((a: any) => ({
        publicKey: a.publicKey,
        ...a.account,
      }));
    } catch {
      return [];
    }
  }, [wallet]);

  const fetchPact = useCallback(
    async (address: string): Promise<PactAccount | null> => {
      try {
        const program = getProgram(wallet!);
        const pubkey = new PublicKey(address);
        const account = await (program.account as any).pactState.fetch(pubkey);
        return { publicKey: pubkey, ...account };
      } catch {
        return null;
      }
    },
    [wallet]
  );

  const fetchReputation = useCallback(
    async (memberAddress: string, pactAddress: string): Promise<ReputationAccount | null> => {
      try {
        const program = getProgram(wallet!);
        const [reputationPDA] = getReputationPDA(
          new PublicKey(memberAddress),
          new PublicKey(pactAddress)
        );
        const account = await (program.account as any).reputationState.fetch(reputationPDA);
        return account;
      } catch {
        return null;
      }
    },
    [wallet]
  );

  return {
    createPact,
    joinPact,
    contribute,
    releasePayout,
    fetchAllPacts,
    fetchPact,
    fetchReputation,
    loading,
    error,
  };
}
