import { Component, Input } from '@angular/core';
import { ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';

/**
 * Generated class for the BlockSummaryComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'block-summary-part',
  templateUrl: 'block-summary-part.html'
})
export class BlockSummaryPartComponent {
  @Input()
  public block: any = {};
  @Input()
  public chainNetwork: ChainNetwork;

  constructor(
    public currencyProvider: CurrencyProvider
  ) {
  }
}
