import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class HeaderService {

    itemId: string = "header-home";

    handleHeaderClick(itemId: string) {   
        this.itemId = itemId;
    }

    getItemId() {
        return this.itemId;
    }

}