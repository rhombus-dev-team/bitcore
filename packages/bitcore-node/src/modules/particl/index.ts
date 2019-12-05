import { ParticlP2PWorker } from './p2p';
import { BaseModule } from "..";
import { PARTStateProvider } from "../../providers/chain-state/part/part";

export default class ParticlModule extends BaseModule {
  constructor(services: BaseModule["bitcoreServices"]) {
    super(services);
    services.Libs.register('PART', 'bitcore-lib-particl', 'bitcore-p2p-particl');
    services.P2P.register('PART', ParticlP2PWorker);
    services.CSP.registerService('PART', new PARTStateProvider());
  }
}
