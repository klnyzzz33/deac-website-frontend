import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { PopupModalComponent } from '../shared/popup-modal/popup-modal.component';
import { PopupModalService } from '../shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-site',
    templateUrl: './site.component.html',
    styleUrls: ['./site.component.css']
})
export class SiteComponent implements AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    timeout: any;

    inactiveSubject: Subject<any> = new Subject();

    inactiveSubscription: Subscription;

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) { }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popup);
        this.resetTimeout();
        this.inactiveSubscription = this.inactiveSubject.subscribe(() => {
            this.popupModalService.openPopup();
        });
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeout);
        this.inactiveSubscription.unsubscribe();
    }

    resetTimeout() {
        this.timeout = setTimeout(() => {
            this.inactiveSubject.next(null);
        }, 300000);
    }

    @HostListener('window:mousemove')
    @HostListener('window:click')
    @HostListener('window:keypress')
    refreshTimeout() {
        clearTimeout(this.timeout);
        this.resetTimeout();
    }

    closePopup() {
        this.popupModalService.closePopup();
        this.refreshTimeout();
    }

    onLogout() {
        this.http.get(
            'http://localhost:8080/api/user/logout',
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData) => {
                    localStorage.clear();
                    this.router.navigate(['']);
                },
                error: (error) => { console.log("Error logging out") },
                complete: () => { }
            });
    }

}
