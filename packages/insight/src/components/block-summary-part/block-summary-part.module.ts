import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { BlockSummaryRhomComponent } from './block-summary-rhom';

import { CopyToClipboardModule } from '../../directives/copy-to-clipboard/copy-to-clipboard.module';

@NgModule({
  declarations: [BlockSummaryRhomComponent],
  imports: [IonicModule, CopyToClipboardModule],
  exports: [BlockSummaryRhomComponent]
})
export class BlockSummaryRhomComponentModule {}
