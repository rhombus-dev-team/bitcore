import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { LoaderComponentModule } from '../loader/loader.module';
import { TransactionDetailsEthComponentModule } from '../transaction-details-eth/transaction-details-eth.module';
import { TransactionDetailsPartComponentModule } from '../transaction-details-part/transaction-details-part.module';
import { TransactionDetailsComponentModule } from '../transaction-details/transaction-details.module';
import { TransactionListComponent } from './transaction-list';

@NgModule({
  declarations: [TransactionListComponent],
  imports: [IonicModule, TransactionDetailsEthComponentModule, TransactionDetailsPartComponentModule, TransactionDetailsComponentModule, LoaderComponentModule],
  exports: [TransactionListComponent]
})
export class TransactionListComponentModule {}
