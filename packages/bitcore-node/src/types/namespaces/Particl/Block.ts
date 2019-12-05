import { ParticlTransactionType } from "./Transaction";
export type BlockHeaderObj = {
  prevHash: string;
  hash: string;
  time: number;
  version: number;
  merkleRoot: string;
  witnessMerkleRoot: string;
  bits: number;
  nonce: number;
}
export type BlockHeader = {
  toObject: () => BlockHeaderObj;
  getDifficulty: () => number;
};
export type ParticlBlockType = {
  hash: string;
  transactions: ParticlTransactionType[];
  header: BlockHeader;
  blockSig: string;
  toBuffer: () => Buffer;
};
