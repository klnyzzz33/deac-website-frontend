import { Injectable, Optional } from '@angular/core';
import { PopupModalComponent } from './popup-modal.component';

@Injectable({providedIn: 'root'})
export class PopupModalService {

    modal: PopupModalComponent;

    constructor() {}

    setModal(modal: PopupModalComponent) {
        this.modal = modal;
    }

    openPopup(modal: any = null) {
        this.modal.open();
    }

    closePopup(modal: any = null) {
        this.modal.close();
    }

}
