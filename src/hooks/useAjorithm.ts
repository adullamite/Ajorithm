import { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { triggerToast } from './useAppToast';
import idl from '../idl/ajorithmIDL.json';

const PROGRAM_ID = new PublicKey('DNxjy5KkrdJsuf9NNRMcdEuiuME1yV9Rxb8ETLJyAV9f');

export interface PactState {
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

export interface ReputationState {
  member: PublicKey;
  contributionsMade: number;
  contributionsMissed: number;
  streak: number;
  bump: number;
}

function getProgram(provider: AnchorProvider) {
  return new Program(idl as any, provider);
}

function getProvider(connection: any, wallet: any): AnchorProvider | null {
  if (!wallet?.publicKey || !wallet?.signTransaction) return null;
  return new AnchorProvider(connection, wallet as any, {
    commitment: 'confirmed',
  });
}

export function useAjorithm() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const createPact = useCallback(
    async (name: string, contributionAmount: number, maxMembers: number) => {
      const provider = getProvider(connection, wallet);
      if (!provider || !wallet.publicKey) {
        triggerToast({ type: 'error', title: 'Wallet not connected' });
        return null;
      }

      setLoading(true);
      try {
        const program = getProgram(provider);
        const amountLamports = new BN(contributionAmount * LAMPORTS_PER_SOL);

        const [pactPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('pact'), wallet.publicKey.toBuffer(), Buffer.from(name)],
          PROGRAM_ID
        );

        const [reputationPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('reputation'), wallet.publicKey.toBuffer(), pactPda.toBuffer()],
          PROGRAM_ID
        );

        const [escrowPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('escrow'), pactPda.toBuffer()],
          PROGRAM_ID
        );

        const tx = await (program.methods as any)
          .createPact(name, amountLamports, maxMembers)
          .accounts({
            pact: pactPda,
            organizerReputation: reputationPda,
            escrow: escrowPda,
            organizer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        triggerToast({ type: 'success', title: 'Pact created on-chain!', message: `TX: ${tx.slice(0, 8)}...` });
        return { pactAddress: pactPda, tx };
      } catch (err: any) {
        const msg = err?.message || 'Failed to create pact';
        triggerToast({ type: 'error', title: 'Create Pact Failed', message: msg });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const joinPact = useCallback(
    async (pactAddress: PublicKey) => {
      const provider = getProvider(connection, wallet);
      if (!provider || !wallet.publicKey) {
        triggerToast({ type: 'error', title: 'Wallet not connected' });
        return null;
      }

      setLoading(true);
      try {
        const program = getProgram(provider);

        const [reputationPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('reputation'), wallet.publicKey.toBuffer(), pactAddress.toBuffer()],
          PROGRAM_ID
        );

        const tx = await (program.methods as any)
          .joinPact()
          .accounts({
            pact: pactAddress,
            memberReputation: reputationPda,
            member: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        triggerToast({ type: 'success', title: 'You joined the pact!', message: `TX: ${tx.slice(0, 8)}...` });
        return tx;
      } catch (err: any) {
        const msg = err?.message || 'Failed to join pact';
        triggerToast({ type: 'error', title: 'Join Pact Failed', message: msg });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const contribute = useCallback(
    async (pactAddress: PublicKey) => {
      const provider = getProvider(connection, wallet);
      if (!provider || !wallet.publicKey) {
        triggerToast({ type: 'error', title: 'Wallet not connected' });
        return null;
      }

      setLoading(true);
      try {
        const program = getProgram(provider);

        const [reputationPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('reputation'), wallet.publicKey.toBuffer(), pactAddress.toBuffer()],
          PROGRAM_ID
        );

        const [escrowPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('escrow'), pactAddress.toBuffer()],
          PROGRAM_ID
        );

        const tx = await (program.methods as any)
          .contribute()
          .accounts({
            pact: pactAddress,
            memberReputation: reputationPda,
            escrow: escrowPda,
            member: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        triggerToast({ type: 'success', title: 'Contribution sent!', message: `TX: ${tx.slice(0, 8)}...` });
        return tx;
      } catch (err: any) {
        const msg = err?.message || 'Failed to contribute';
        triggerToast({ type: 'error', title: 'Contribution Failed', message: msg });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const releasePayout = useCallback(
    async (pactAddress: PublicKey, recipientAddress: PublicKey) => {
      const provider = getProvider(connection, wallet);
      if (!provider || !wallet.publicKey) {
        triggerToast({ type: 'error', title: 'Wallet not connected' });
        return null;
      }

      setLoading(true);
      try {
        const program = getProgram(provider);

        const [escrowPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('escrow'), pactAddress.toBuffer()],
          PROGRAM_ID
        );

        const tx = await (program.methods as any)
          .releasePayout()
          .accounts({
            pact: pactAddress,
            escrow: escrowPda,
            recipient: recipientAddress,
            organizer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        triggerToast({ type: 'success', title: 'Payout released!', message: `TX: ${tx.slice(0, 8)}...` });
        return tx;
      } catch (err: any) {
        const msg = err?.message || 'Failed to release payout';
        triggerToast({ type: 'error', title: 'Release Payout Failed', message: msg });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const updateReputation = useCallback(
    async (pactAddress: PublicKey, memberAddress: PublicKey, missed: boolean) => {
      const provider = getProvider(connection, wallet);
      if (!provider || !wallet.publicKey) {
        triggerToast({ type: 'error', title: 'Wallet not connected' });
        return null;
      }

      setLoading(true);
      try {
        const program = getProgram(provider);

        const [reputationPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('reputation'), memberAddress.toBuffer(), pactAddress.toBuffer()],
          PROGRAM_ID
        );

        const tx = await (program.methods as any)
          .updateReputation(missed)
          .accounts({
            pact: pactAddress,
            memberReputation: reputationPda,
            member: memberAddress,
            organizer: wallet.publicKey,
          })
          .rpc();

        triggerToast({ type: 'success', title: 'Reputation updated!' });
        return tx;
      } catch (err: any) {
        const msg = err?.message || 'Failed to update reputation';
        triggerToast({ type: 'error', title: 'Update Failed', message: msg });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const fetchPact = useCallback(
    async (pactAddress: PublicKey): Promise<PactState | null> => {
      const provider = getProvider(connection, wallet);
      if (!provider) return null;

      try {
        const program = getProgram(provider);
        const account = await (program.account as any).pactState.fetch(pactAddress);
        return { publicKey: pactAddress, ...account } as PactState;
      } catch {
        return null;
      }
    },
    [connection, wallet]
  );

  const fetchReputation = useCallback(
    async (memberKey: PublicKey, pactAddress: PublicKey): Promise<ReputationState | null> => {
      const provider = getProvider(connection, wallet);
      if (!provider) return null;

      try {
        const program = getProgram(provider);
        const [reputationPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('reputation'), memberKey.toBuffer(), pactAddress.toBuffer()],
          PROGRAM_ID
        );
        const account = await (program.account as any).reputationState.fetch(reputationPda);
        return account as ReputationState;
      } catch {
        return null;
      }
    },
    [connection, wallet]
  );

  const fetchAllPacts = useCallback(async (): Promise<PactState[]> => {
    const provider = getProvider(connection, wallet);
    if (!provider) return [];

    try {
      const program = getProgram(provider);
      const accounts = await (program.account as any).pactState.all();
      return accounts.map((a: any) => ({
        publicKey: a.publicKey,
        ...a.account,
      })) as PactState[];
    } catch {
      return [];
    }
  }, [connection, wallet]);

  return {
    loading,
    createPact,
    joinPact,
    contribute,
    releasePayout,
    updateReputation,
    fetchPact,
    fetchReputation,
    fetchAllPacts,
  };
}
