export type RhombusAddress = {
  toString: (stripCash: boolean) => string;
};
export type RhombusScript = {
  toBuffer: () => Buffer;
  toHex: () => string;
  classify: () => string;
  chunks: Array<{ buf: Buffer }>;
  toAddress: (network: string) => RhombusAddress;
};
export type RhombusInputObj = {
  prevTxId: string;
  outputIndex: number;
  sequenceNumber: number;
  data?: string;
  witnesses: string[];
};
export type RhombusInput = {
  toObject: () => RhombusInputObj;
};
export type RhombusOutput = {
  script: RhombusScript;
  satoshis: number;
  type?: number;
  data?: Buffer;
  pubkey?: Buffer;
  valueCommitment?: Buffer;
  rangeproof?: Buffer;
};
export type RhombusTransactionType = {
  outputAmount: number;
  hash: string;
  _hash: undefined | string;
  isCoinbase: () => boolean;
  isCoinStake: () => boolean;
  outputs: RhombusOutput[];
  inputs: RhombusInput[];
  toBuffer: () => Buffer;
  nLockTime: number;
  version: number;
};
