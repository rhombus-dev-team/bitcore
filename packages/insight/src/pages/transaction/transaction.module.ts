import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ErrorComponentModule } from '../../components/error/error.module';
import { FooterComponentModule } from '../../components/footer/footer.module';
import { HeadNavComponentModule } from '../../components/head-nav/head-nav.module';
import { LoaderComponentModule } from '../../components/loader/loader.module';
import { TransactionDetailsEthComponentModule } from '../../components/transaction-details-eth/transaction-details-eth.module';
import { TransactionDetailsRhomComponentModule } from '../../components/transaction-details-rhom/transaction-details-rhom.module';
import { TransactionDetailsComponentModule } from '../../components/transaction-details/transaction-details.module';
import { TransactionSummaryEthComponentModule } from '../../components/transaction-summary-eth/transaction-summary-eth.module';
import { TransactionSummaryRhomComponentModule } from '../../components/transaction-summary-rhom/transaction-summary-rhom.module';
import { TransactionSummaryComponentModule } from '../../components/transaction-summary/transaction-summary.module';
import { CopyToClipboardModule } from '../../directives/copy-to-clipboard/copy-to-clipboard.module';
import { TransactionPage } from './transaction';

@NgModule({
  declarations: [TransactionPage],
  imports: [
    IonicPageModule.forChild(TransactionPage),
    TransactionSummaryEthComponentModule,
    TransactionSummaryRhomComponentModule,
    TransactionSummaryComponentModule,
    TransactionDetailsComponentModule,
    TransactionDetailsEthComponentModule,
    TransactionDetailsRhomComponentModule,
    FooterComponentModule,
    HeadNavComponentModule,
    LoaderComponentModule,
    ErrorComponentModule,
    CopyToClipboardModule
  ],
  exports: [TransactionPage]
})
export class TransactionPageModule {}
