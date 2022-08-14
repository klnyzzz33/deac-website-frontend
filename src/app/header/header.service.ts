import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class HeaderService {

    headerId: string = "header-home";

    constructor() {}

    getHeaderId() {
        return this.headerId;
    }

    setHeaderId(headerId: string) {
        this.headerId = headerId;
    }

}