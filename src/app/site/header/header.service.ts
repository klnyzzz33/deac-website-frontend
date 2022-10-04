import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class HeaderService {

    private supportNotificationCount = new Subject<number>();

    constructor() { }

    getSupportNotificationCount() {
        return this.supportNotificationCount.asObservable();
    }

    changeSupportNotificationCount(value: number) {
        this.supportNotificationCount.next(value);
    }

}