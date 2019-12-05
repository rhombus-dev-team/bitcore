import { ParticlBlockType, BlockHeader, BlockHeaderObj } from './Block';
import {
  ParticlTransactionType,
  ParticlOutput,
  ParticlInput,
  ParticlScript,
  ParticlAddress,
  ParticlInputObj
} from './Transaction';

export declare namespace Particl {
  export type Block = ParticlBlockType;
  export type Transaction = ParticlTransactionType;
  export type Script = ParticlScript;
  export type Address = ParticlAddress;
}

export declare namespace Particl.Transaction {
  export type Output = ParticlOutput;
  export type Input = ParticlInput;
  export type InputObj = ParticlInputObj;
}

export declare namespace Particl.Block {
  export type Header = BlockHeader;
  export type HeaderObj = BlockHeaderObj
}
