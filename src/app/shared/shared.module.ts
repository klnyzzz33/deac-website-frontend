import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupModalComponent } from './popup-modal/popup-modal.component';

@NgModule({
  declarations: [PopupModalComponent],
  imports: [CommonModule],
  providers: [],
  exports: [PopupModalComponent]
})
export class SharedModule {}
