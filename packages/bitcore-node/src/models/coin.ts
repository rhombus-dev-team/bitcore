import { LoggifyClass } from '../decorators/Loggify';
import { BaseModel, MongoBound } from './base';
import { ObjectID, CollectionAggregationOptions } from 'mongodb';
import { SpentHeightIndicators, CoinJSON } from '../types/Coin';
import { valueOrDefault } from '../utils/check';
import { StorageService } from '../services/storage';
import { BitcoinBlockStorage } from './block';
import { Libs } from '../providers/libs';

export type ICoin = {
  network: string;
  chain: string;
  mintTxid: string;
  mintIndex: number;
  mintHeight: number;
  coinbase: boolean;
  value: number;
  address: string;
  script: Buffer;
  wallets: Array<ObjectID>;
  spentTxid: string;
  spentHeight: number;
  confirmations?: number;
  witnesses?: string[];
  type?: number;
  data?: Buffer;
  pubkey?: Buffer;
  valueCommitment?: Buffer;
  rangeproof?: Buffer;
  coinstake?: boolean;
};

@LoggifyClass
export class CoinModel extends BaseModel<ICoin> {
  constructor(storage?: StorageService) {
    super('coins', storage);
  }

  allowedPaging = [
    { key: 'mintHeight' as 'mintHeight', type: 'number' as 'number' },
    { key: 'spentHeight' as 'spentHeight', type: 'number' as 'number' }
  ];

  onConnect() {
    this.collection.createIndex({ mintTxid: 1, mintIndex: 1 }, { background: true });
    this.collection.createIndex(
      { address: 1, chain: 1, network: 1 },
      {
        background: true,
        partialFilterExpression: {
          spentHeight: { $lt: 0 }
        }
      }
    );
    this.collection.createIndex({ address: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, mintHeight: 1 }, { background: true });
    this.collection.createIndex({ spentTxid: 1 }, { background: true, sparse: true });
    this.collection.createIndex({ chain: 1, network: 1, spentHeight: 1 }, { background: true });
    this.collection.createIndex(
      { wallets: 1, spentHeight: 1, value: 1, mintHeight: 1 },
      { background: true, partialFilterExpression: { 'wallets.0': { $exists: true } } }
    );
    this.collection.createIndex(
      { wallets: 1, spentTxid: 1 },
      { background: true, partialFilterExpression: { 'wallets.0': { $exists: true } } }
    );
    this.collection.createIndex(
      { wallets: 1, mintTxid: 1 },
      { background: true, partialFilterExpression: { 'wallets.0': { $exists: true } } }
    );
  }

  async getBalance(params: { query: any }, options: CollectionAggregationOptions = {}) {
    let { query } = params;
    const result = await this.collection
      .aggregate<{ _id: string; balance: number }>(
        [
          { $match: query },
          {
            $project: {
              value: 1,
              status: {
                $cond: {
                  if: { $gte: ['$mintHeight', SpentHeightIndicators.minimum] },
                  then: 'confirmed',
                  else: 'unconfirmed'
                }
              },
              _id: 0
            }
          },
          {
            $group: {
              _id: '$status',
              balance: { $sum: '$value' }
            }
          }
        ],
        options
      )
      .toArray();
    return result.reduce<{ confirmed: number; unconfirmed: number; balance: number }>(
      (acc, cur) => {
        acc[cur._id] = cur.balance;
        acc.balance += cur.balance;
        return acc;
      },
      { confirmed: 0, unconfirmed: 0, balance: 0 }
    );
  }

  async getBalanceAtTime(params: { query: any; time: string; chain: string; network: string }) {
    let { query, time, chain, network } = params;
    const [block] = await BitcoinBlockStorage.collection
      .find({
        $query: {
          chain,
          network,
          timeNormalized: { $lte: new Date(time) }
        }
      })
      .limit(1)
      .sort({ timeNormalized: -1 })
      .toArray();
    const blockHeight = block!.height;
    const combinedQuery = Object.assign(
      {},
      {
        $or: [{ spentHeight: { $gt: blockHeight } }, { spentHeight: SpentHeightIndicators.unspent }],
        mintHeight: { $lte: blockHeight }
      },
      query
    );
    return this.getBalance({ query: combinedQuery }, { hint: { wallets: 1, spentHeight: 1, value: 1, mintHeight: 1 } });
  }

  resolveAuthhead(mintTxid: string, chain?: string, network?: string) {
    return this.collection
      .aggregate<{
        chain: string;
        network: string;
        authbase: string;
        identityOutputs: ICoin[];
      }>([
        {
          $match: {
            mintTxid: mintTxid.toLowerCase(),
            mintIndex: 0,
            ...(typeof chain === 'string' ? { chain } : {}),
            ...(typeof network === 'string' ? { network } : {})
          }
        },
        {
          $graphLookup: {
            from: 'coins',
            startWith: '$spentTxid',
            connectFromField: 'spentTxid',
            connectToField: 'mintTxid',
            as: 'authheads',
            maxDepth: 1000000,
            restrictSearchWithMatch: {
              mintIndex: 0
            }
          }
        },
        {
          $project: {
            chain: '$chain',
            network: '$network',
            authbase: '$mintTxid',
            identityOutputs: {
              $filter: {
                input: '$authheads',
                as: 'authhead',
                cond: {
                  $and: [
                    {
                      $lte: ['$$authhead.spentHeight', -1]
                    },
                    {
                      $eq: ['$$authhead.chain', '$chain']
                    },
                    {
                      $eq: ['$$authhead.network', '$network']
                    }
                  ]
                }
              }
            }
          }
        }
      ])
      .toArray();
  }

  _apiTransform(coin: Partial<MongoBound<ICoin>>, options?: { object: boolean }): any {
    coin.script = valueOrDefault(coin.script, Buffer.alloc(0));
    const script = Libs.get(coin.chain).lib.Script.fromBuffer(coin.script.buffer);
    const scriptInfo = {
      type: script.classify(),
      asm: script.toASM()
    }

    coin.data = valueOrDefault(coin.data, Buffer.alloc(0));
    const dataInfo = this._getDataInfo(coin);

    const transform: CoinJSON = {
      _id: valueOrDefault(coin._id, new ObjectID()).toHexString(),
      chain: valueOrDefault(coin.chain, ''),
      network: valueOrDefault(coin.network, ''),
      coinbase: valueOrDefault(coin.coinbase, false),
      mintIndex: valueOrDefault(coin.mintIndex, -1),
      spentTxid: valueOrDefault(coin.spentTxid, ''),
      mintTxid: valueOrDefault(coin.mintTxid, ''),
      mintHeight: valueOrDefault(coin.mintHeight, -1),
      spentHeight: valueOrDefault(coin.spentHeight, SpentHeightIndicators.error),
      address: valueOrDefault(coin.address, ''),
      script: coin.script.toString('hex'),
      value: valueOrDefault(coin.value, -1),
      confirmations: valueOrDefault(coin.confirmations, -1),
      witnesses: valueOrDefault(coin.witnesses, []),
      type: valueOrDefault(coin.type, -1),
      scriptInfo,
      coinstake: valueOrDefault(coin.coinstake, false),
      data: coin.data.toString('hex'),
      dataInfo
    };

    if ([2, 3].indexOf(transform.type || -1) !== -1) {
      transform.valueCommitment = (coin.valueCommitment || Buffer.alloc(0)).toString('hex')

      if (transform.type === 3 && transform.mintTxid.indexOf('_') !== -1) {
        const prevTxBuf = Buffer.from(Buffer.from(transform.mintTxid.split('_')[0], 'hex').reverse()); // :/
        transform.num_inputs = prevTxBuf.readUIntLE(0, 4)
        transform.ring_size = prevTxBuf.readUIntLE(4, 4)
      }
      transform.rangeproof = valueOrDefault(coin.rangeproof, Buffer.alloc(0)).toString('hex');
      transform.rangeproofInfo = this._getRangeProofInfo(coin);
    }
    if (options && options.object) {
      return transform;
    }
    return JSON.stringify(transform);
  }

  private _getDataInfo(coin: Partial<MongoBound<ICoin>>) {
    const dataInfo: any[] = [];

    const data_bytes = valueOrDefault(coin.data, Buffer.alloc(0)).buffer;
    let offset = 0;
    if (coin.coinstake)
    {
      if (data_bytes.byteLength >= 4)
      {
        let height = 0;
        for (let i = 3; i >= 0; i--) {
          height = (height << 8) + data_bytes[i];
        }
        dataInfo.push({name:"height",value:height});
        offset+=4;
      };
    };
    while(offset < data_bytes.byteLength)
    {
      const type = data_bytes[offset];
      let error = false;
      offset++;

      switch (type) {
        // VOTE
        case 5:
          if (offset + 4 > data_bytes.byteLength) {
            dataInfo.push({name:"error",value:type});
            error = true;
          } else {
            let vote = 0;
            for (let i = offset + 3; i >= offset; i--) {
              vote = (vote << 8) + data_bytes[i];
            }
            offset+=4;
            const strvote = "proposal " + (vote & 0xFFFF) + ", option " + (vote >> 16);
            dataInfo.push({name:"vote",value:strvote});
          }
          break;

        // FEE
        case 6:
          if (offset + 1 > data_bytes.byteLength) {
            dataInfo.push({name:"error",value:type});
            error = true;
          } else {
            const vi = this.getVarIntAsFloat(offset, data_bytes);
            const fee = vi[0] / 1e8;
            offset += vi[1]+1;
            dataInfo.push({name:"fee",value:fee});
          }
          break;

        // DEV_FUND_CFWD
        case 7:
          if (offset + 1 > data_bytes.byteLength) {
            dataInfo.push({name:"error",value:type});
            error = true;
          } else {
            const vi = this.getVarIntAsFloat(offset, data_bytes);
            const cfwd = vi[0] / 1e8;
            offset += vi[1]+1;
            dataInfo.push({name:"foundation-fund",value:cfwd});
          }
          break;

        // DO_SMSG_FEE
        case 9:
          if (offset + 1 > data_bytes.byteLength) {
            dataInfo.push({name:"error",value:type});
            break;
          } else {
            const vi = this.getVarIntAsFloat(offset, data_bytes);
            let value = vi[0] /= 1e8;
            offset += vi[1]+1;
            dataInfo.push({name:"smsg-fee-rate",value:value});
          }
          break;

        // DO_SMSG_DIFFICULTY
        case 10:
          if (offset + 1 > data_bytes.byteLength) {
            dataInfo.push({name:"error",value:type});
            break;
          } else {
            const vi = this.getVarIntAsFloat(offset, data_bytes);
            const value = vi[0];
            offset += vi[1]+1;
            dataInfo.push({name:"smsg-difficulty",value:Math.round(value).toString(16)});
          }
          break;

        default:
          dataInfo.push({name:"unknown",value:type});
          error = true;
      }

      if (error) {
        break;
      }
    }

    return dataInfo;
  }

  private getVarIntAsFloat(offset, data_bytes)
  {
    var fl = 0.0;
    var i;
    for (i = 0; i < 10; ++i)
    {
      var b = data_bytes[offset++];
      fl += (b & 0x7F) * Math.pow(2.0, 7*i)
      if (!(b & 0x80) || offset >= data_bytes.byteLength)
        break
    }
    
    return [fl, i];
  }

  private _getRangeProofInfo(coin: Partial<MongoBound<ICoin>>) {
    const UINT64_MAX = BigInt("0xffffffffffffffff");

    const proof = coin.rangeproof ? coin.rangeproof.buffer : Buffer.from([]);

    let exp: number, mantissa: number, min_value: number, max_value: any;
    let offset = 0;

    if (proof.byteLength > 500 && proof.byteLength < 1000) {
      return {
        size: proof.byteLength
      }
    }

    if (proof.byteLength < 65 || ((proof[offset] & 128) != 0)) {
      return;
    }

    let i, has_nz_range, has_min;

    has_nz_range = proof[offset] & 64;
    has_min = proof[offset] & 32;
    exp = -1;
    mantissa = 0;

    if (has_nz_range) {
      exp = proof[offset] & 31;
      offset += 1;
      if (exp > 18) {
        return;
      }
      mantissa = proof[offset] + 1;
      if (mantissa > 64) {
        return;
      }
      max_value = UINT64_MAX>>BigInt(64-mantissa);
    } else {
      max_value = BigInt(0);
    }
    offset += 1;
    for (i = 0; i < exp; i++) {
      if (max_value > UINT64_MAX / BigInt(10)) {
        return;
      }
      max_value *= BigInt(10);
    }
    min_value = 0;
    if (has_min) {
      if(proof.byteLength - offset < 8) {
        return;
      }
      /*FIXME: Compact minvalue encoding?*/
      for (i = 0; i < 8; i++) {
        min_value = (min_value << 8) | proof[offset + i];
      }
      offset += 8;
    }
    if (max_value > UINT64_MAX - BigInt(min_value)) {
      return;
    }
    max_value += BigInt(min_value);
    return {
      exp,
      mantissa,
      min_value: min_value,
      max_value: this.valueFromAmount(max_value),
      size: proof.byteLength
    };
  }

  private valueFromAmount(value: BigInt) {
    const COIN = 100000000;
    const sign = value < BigInt(0);

    const n_abs = BigInt(sign ? -value : value);
    const quotient = n_abs / BigInt(COIN);
    const remainder = n_abs % BigInt(COIN);

    return parseFloat(`${quotient}.${remainder}`);
  }
}
export let CoinStorage = new CoinModel();
