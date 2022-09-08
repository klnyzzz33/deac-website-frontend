import { Injectable } from '@angular/core';
import { PopupModalComponent } from './popup-modal.component';

@Injectable({ providedIn: 'root' })
export class PopupModalService {

    modals = new Map<string, PopupModalComponent>();

    constructor() { }

    setModal(name: string, modal: PopupModalComponent) {
        this.modals.set(name, modal);
    }

    unsetModal(name: string) {
        this.modals.delete(name);
    }

    openPopup(name: string) {
        this.modals.get(name)?.open();
    }

    closePopup(name: string) {
        this.modals.get(name)?.close();
    }

    closeAll() {
        this.modals.forEach((modal: PopupModalComponent) => {
            modal.close();
        });
    }

}
