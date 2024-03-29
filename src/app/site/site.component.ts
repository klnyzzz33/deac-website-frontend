import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { PopupModalComponent } from '../shared/popup-modal/popup-modal.component';
import { PopupModalService } from '../shared/popup-modal/popup-modal.service';
import { AuthService } from './auth/auth.service';

@Component({
    selector: 'app-site',
    templateUrl: './site.component.html',
    styleUrls: ['./site.component.css']
})
export class SiteComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "timeout";

    timeout: any;

    inactiveSubject: Subject<any> = new Subject();

    inactiveSubscription: Subscription;

    isLoggedIn = false;

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService, private authService: AuthService, translate: TranslateService) {
        translate.setDefaultLang("hu");
        let lang = localStorage.getItem("language");
        if (lang) {
            translate.use(lang);
        }
    }

    ngOnInit(): void {
        this.isLoggedIn = this.authService.hasClientPrivileges() || this.authService.hasAdminPrivileges();
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
        this.resetTimeout();
        this.inactiveSubscription = this.inactiveSubject.subscribe(() => {
            if (this.isLoggedIn) {
                this.popupModalService.closeAll();
                this.popupModalService.openPopup(this.popupName);
            }
        });
    }

    resetTimeout() {
        this.timeout = setTimeout(() => {
            this.inactiveSubject.next(null);
        }, 300000);
    }

    @HostListener('window:mousemove')
    @HostListener('window:click')
    @HostListener('window:keypress')
    refreshTimer() {
        clearTimeout(this.timeout);
        this.resetTimeout();
    }

    closePopup() {
        this.popupModalService.closePopup(this.popupName);
        this.refreshTimer();
    }

    onLogout() {
        this.http.get(
            'http://localhost:8080/api/user/auth/logout',
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.closePopup(this.popupName);
                    let lang = localStorage.getItem("language");
                    localStorage.clear();
                    if (lang) {
                        localStorage.setItem("language", lang);
                    }
                    setTimeout(() => {
                        this.router.navigate(['/site'])
                            .then(() => {
                                window.location.reload()
                            });
                    }, 1000);
                },
                error: (error) => {
                    console.log("Error logging out");
                    this.popupModalService.closePopup(this.popupName);
                    let lang = localStorage.getItem("language");
                    localStorage.clear();
                    if (lang) {
                        localStorage.setItem("language", lang);
                    }
                    this.router.navigate(['/site']);
                },
                complete: () => { }
            });
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeout);
        this.inactiveSubscription.unsubscribe();
        this.popupModalService.unsetModal(this.popupName);
    }

}
