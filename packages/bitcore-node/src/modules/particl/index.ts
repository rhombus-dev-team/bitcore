import { RhombusP2PWorker } from './p2p';
import { BaseModule } from "..";
import { PARTStateProvider } from "../../providers/chain-state/part/rhom";

export default class RhombusModule extends BaseModule {
  constructor(services: BaseModule["bitcoreServices"]) {
    super(services);
    services.Libs.register('PART', 'bitcore-lib-rhombus', 'bitcore-p2p-rhombus');
    services.P2P.register('PART', RhombusP2PWorker);
    services.CSP.registerService('PART', new PARTStateProvider());
  }
}
