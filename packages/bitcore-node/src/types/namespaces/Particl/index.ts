import { RhombusBlockType, BlockHeader, BlockHeaderObj } from './Block';
import {
  RhombusTransactionType,
  RhombusOutput,
  RhombusInput,
  RhombusScript,
  RhombusAddress,
  RhombusInputObj
} from './Transaction';

export declare namespace Rhombus {
  export type Block = RhombusBlockType;
  export type Transaction = RhombusTransactionType;
  export type Script = RhombusScript;
  export type Address = RhombusAddress;
}

export declare namespace Rhombus.Transaction {
  export type Output = RhombusOutput;
  export type Input = RhombusInput;
  export type InputObj = RhombusInputObj;
}

export declare namespace Rhombus.Block {
  export type Header = BlockHeader;
  export type HeaderObj = BlockHeaderObj
}
