import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { TransactionDetailsPartComponent } from './transaction-details-part';

import { CopyToClipboardModule } from '../../directives/copy-to-clipboard/copy-to-clipboard.module';

@NgModule({
  declarations: [TransactionDetailsPartComponent],
  imports: [IonicModule, CopyToClipboardModule],
  exports: [TransactionDetailsPartComponent]
})
export class TransactionDetailsPartComponentModule {}
