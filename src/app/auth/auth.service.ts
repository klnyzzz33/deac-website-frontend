import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class AuthService {

    isTokenExpired = new Subject<boolean>();

    getIsTokenExpired() {
        return this.isTokenExpired;
    }

    setIsTokenExpired(value: boolean) {
        this.isTokenExpired.next(value);
    }

}