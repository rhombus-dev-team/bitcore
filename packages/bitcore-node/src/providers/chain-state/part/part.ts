import { InternalStateProvider } from "../internal/internal";
import { CSP } from "../../../types/namespaces/ChainStateProvider";
import { IBlock } from "../../../models/baseBlock";
import { ParticlBlockStorage, IPartBlock } from "../../../modules/particl/models/block";
import { Storage } from "../../../services/storage";

export class PARTStateProvider extends InternalStateProvider{
  constructor(chain: string = 'PART') {
    super(chain);
  }

  streamBlocks(params: CSP.StreamBlocksParams) {
    const { req, res } = params;
    const { query, options } = this.getBlocksQuery(params);
    Storage.apiStreamingFind(ParticlBlockStorage, query, options, req, res);
  }

  async getBlocks(params: CSP.GetBlockParams): Promise<Array<IBlock>> {
    const { query, options } = this.getBlocksQuery(params);
    let cursor = ParticlBlockStorage.collection.find(query, options).addCursorFlag('noCursorTimeout', true);
    if (options.sort) {
      cursor = cursor.sort(options.sort);
    }
    let blocks = await cursor.toArray();
    const tip = await this.getLocalTip(params);
    const tipHeight = tip ? tip.height : 0;
    const blockTransform = (b: IPartBlock) => {
      let confirmations = 0;
      if (b.height && b.height >= 0) {
        confirmations = tipHeight - b.height + 1;
      }
      const convertedBlock = ParticlBlockStorage._apiTransform(b, { object: true }) as IPartBlock;
      return { ...convertedBlock, confirmations };
    };
    return blocks.map(blockTransform);
  }

  async getDailyTransactions({ chain, network }: { chain: string; network: string }) {
    const beforeBitcoin = new Date('2009-01-09T00:00:00.000Z');
    const todayTruncatedUTC = new Date(new Date().toISOString().split('T')[0]);
    const results = await ParticlBlockStorage.collection
      .aggregate<{
        date: string;
        transactionCount: number;
      }>([
        {
          $match: {
            chain,
            network,
            timeNormalized: {
              $gte: beforeBitcoin,
              $lt: todayTruncatedUTC
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timeNormalized'
              }
            },
            transactionCount: {
              $sum: '$transactionCount'
            }
          }
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            transactionCount: '$transactionCount'
          }
        },
        {
          $sort: {
            date: 1
          }
        }
      ])
      .toArray();
    return {
      chain,
      network,
      results
    };
  }

  async getLocalTip({ chain, network }) {
    return ParticlBlockStorage.getLocalTip({ chain, network });
  }

  async getLocatorHashes(params) {
    const { chain, network, startHeight, endHeight } = params;
    const query =
      startHeight && endHeight
        ? {
            processed: true,
            chain,
            network,
            height: { $gt: startHeight, $lt: endHeight }
          }
        : {
            processed: true,
            chain,
            network
          };
    const locatorBlocks = await ParticlBlockStorage.collection
      .find(query, { sort: { height: -1 }, limit: 30 })
      .addCursorFlag('noCursorTimeout', true)
      .toArray();
    if (locatorBlocks.length < 2) {
      return [Array(65).join('0')];
    }
    return locatorBlocks.map(block => block.hash);
  }
}
