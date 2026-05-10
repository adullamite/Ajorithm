import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import idl from "@/idl/ajorithmIDL.json";
import { PROGRAM_ID, RPC_ENDPOINT } from "./constants";

export function getProvider(wallet: AnchorWallet): AnchorProvider {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");
  return new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
}

export function getProgram(wallet: AnchorWallet): Program {
  const provider = getProvider(wallet);
  return new Program(idl as Idl, provider);
}

export function getReadOnlyProgram(): Program {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");
  return new Program(idl as Idl, { connection } as AnchorProvider);
}

export function getPactPDA(organizer: PublicKey, name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("pact"), organizer.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
}

export function getEscrowPDA(pact: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), pact.toBuffer()],
    PROGRAM_ID
  );
}

export function getReputationPDA(member: PublicKey, pact: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("reputation"), member.toBuffer(), pact.toBuffer()],
    PROGRAM_ID
  );
}
