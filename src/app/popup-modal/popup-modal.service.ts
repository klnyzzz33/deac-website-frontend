import { Injectable, Optional } from '@angular/core';
import { PopupModalComponent } from './popup-modal.component';

@Injectable({providedIn: 'root'})
export class PopupModalService {

    modal: PopupModalComponent;

    constructor() {}

    setModal(modal: PopupModalComponent) {
        this.modal = modal;
    }

    openPopup() {
        this.modal.open();
    }

    closePopup() {
        this.modal.close();
    }

}
