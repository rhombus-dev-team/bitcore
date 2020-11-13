import { RhombusTransactionType } from "./Transaction";
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
export type RhombusBlockType = {
  hash: string;
  transactions: RhombusTransactionType[];
  header: BlockHeader;
  blockSig: string;
  toBuffer: () => Buffer;
};
