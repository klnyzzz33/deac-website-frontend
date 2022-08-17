import { Injectable, Optional } from '@angular/core';
import { SiteComponent } from '../site/site.component';

@Injectable({providedIn: 'root'})
export class PopupModalService {

    constructor() {}

    openPopup(modal: any) {
        modal.open();
    }

    closePopup(modal: any) {
        modal.close();
    }

}
