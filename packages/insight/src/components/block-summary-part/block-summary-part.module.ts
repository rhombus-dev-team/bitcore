import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { BlockSummaryPartComponent } from './block-summary-part';

import { CopyToClipboardModule } from '../../directives/copy-to-clipboard/copy-to-clipboard.module';

@NgModule({
  declarations: [BlockSummaryPartComponent],
  imports: [IonicModule, CopyToClipboardModule],
  exports: [BlockSummaryPartComponent]
})
export class BlockSummaryPartComponentModule {}
