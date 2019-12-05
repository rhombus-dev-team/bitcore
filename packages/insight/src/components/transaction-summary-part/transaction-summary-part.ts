import { Component, Input } from '@angular/core';
import { ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';

/**
 * Generated class for the TransactionSummaryComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'transaction-summary-part',
  templateUrl: 'transaction-summary-part.html'
})
export class TransactionSummaryPartComponent {
  @Input()
  public tx: any = {};
  @Input()
  public chainNetwork: ChainNetwork;

  constructor(
    public currencyProvider: CurrencyProvider
  ) {
  }
}
