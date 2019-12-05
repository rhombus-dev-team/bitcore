import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ErrorComponentModule } from '../../components/error/error.module';
import { FooterComponentModule } from '../../components/footer/footer.module';
import { HeadNavComponentModule } from '../../components/head-nav/head-nav.module';
import { LoaderComponentModule } from '../../components/loader/loader.module';
import { TransactionDetailsEthComponentModule } from '../../components/transaction-details-eth/transaction-details-eth.module';
import { TransactionDetailsPartComponentModule } from '../../components/transaction-details-part/transaction-details-part.module';
import { TransactionDetailsComponentModule } from '../../components/transaction-details/transaction-details.module';
import { TransactionSummaryEthComponentModule } from '../../components/transaction-summary-eth/transaction-summary-eth.module';
import { TransactionSummaryPartComponentModule } from '../../components/transaction-summary-part/transaction-summary-part.module';
import { TransactionSummaryComponentModule } from '../../components/transaction-summary/transaction-summary.module';
import { CopyToClipboardModule } from '../../directives/copy-to-clipboard/copy-to-clipboard.module';
import { TransactionPage } from './transaction';

@NgModule({
  declarations: [TransactionPage],
  imports: [
    IonicPageModule.forChild(TransactionPage),
    TransactionSummaryEthComponentModule,
    TransactionSummaryPartComponentModule,
    TransactionSummaryComponentModule,
    TransactionDetailsComponentModule,
    TransactionDetailsEthComponentModule,
    TransactionDetailsPartComponentModule,
    FooterComponentModule,
    HeadNavComponentModule,
    LoaderComponentModule,
    ErrorComponentModule,
    CopyToClipboardModule
  ],
  exports: [TransactionPage]
})
export class TransactionPageModule {}
