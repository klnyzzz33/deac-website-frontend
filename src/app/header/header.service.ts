import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class HeaderService {
    
    constructor() {}

    getHeaderTabId() {
        return localStorage.getItem("headerTabId");
    }

    setHeaderTabId(headerId: string) {
        localStorage.setItem("headerTabId", headerId);
    }

}