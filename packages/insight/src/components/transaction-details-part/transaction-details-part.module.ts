import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { TransactionDetailsPartComponent } from './transaction-details-rhom';

import { CopyToClipboardModule } from '../../directives/copy-to-clipboard/copy-to-clipboard.module';

@NgModule({
  declarations: [TransactionDetailsRhomComponent],
  imports: [IonicModule, CopyToClipboardModule],
  exports: [TransactionDetailsRhomComponent]
})
export class TransactionDetailsRhomComponentModule {}
