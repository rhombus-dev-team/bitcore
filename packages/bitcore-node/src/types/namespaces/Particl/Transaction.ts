export type ParticlAddress = {
  toString: (stripCash: boolean) => string;
};
export type ParticlScript = {
  toBuffer: () => Buffer;
  toHex: () => string;
  classify: () => string;
  chunks: Array<{ buf: Buffer }>;
  toAddress: (network: string) => ParticlAddress;
};
export type ParticlInputObj = {
  prevTxId: string;
  outputIndex: number;
  sequenceNumber: number;
  data?: string;
  witnesses: string[];
};
export type ParticlInput = {
  toObject: () => ParticlInputObj;
};
export type ParticlOutput = {
  script: ParticlScript;
  satoshis: number;
  type?: number;
  data?: Buffer;
  pubkey?: Buffer;
  valueCommitment?: Buffer;
  rangeproof?: Buffer;
};
export type ParticlTransactionType = {
  outputAmount: number;
  hash: string;
  _hash: undefined | string;
  isCoinbase: () => boolean;
  isCoinStake: () => boolean;
  outputs: ParticlOutput[];
  inputs: ParticlInput[];
  toBuffer: () => Buffer;
  nLockTime: number;
  version: number;
};
