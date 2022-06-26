import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class PopupModalService {

    openPopup(modal: any) {
        modal.open();
    }

    closePopup(modal: any) {
        modal.close();
    }

}
