import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-site-home',
    templateUrl: './site-home.component.html',
    styleUrls: ['./site-home.component.css']
})
export class SiteHomeComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("subscribesuccesspopup") subscribeSuccessPopup: PopupModalComponent;

    @ViewChild("unsubscribesuccesspopup") unsubscribeSuccessPopup: PopupModalComponent;

    subscribePopupName = "subscribefeedback";

    unsubscribePopupName = "unsubscribefeedback"

    errorMessage: string = null;

    email = "";

    isAdmin = false;

    isClient = false;

    isClientSubscribed = false;

    isUnsubscribeSuccessful = null;

    unsubscribeErrorMessage = null;

    constructor(private http: HttpClient, private router: Router, private authService: AuthService, private popupModalService: PopupModalService) {
        let currentNavigation = this.router.getCurrentNavigation();
        if (currentNavigation != null && currentNavigation.extras["state"]) {
            if (currentNavigation.extras.state["isUnsubscribeSuccessful"]) {
                this.isUnsubscribeSuccessful = true;
            } else if (currentNavigation.extras.state.isUnsubscribeSuccessful === false) {
                this.isUnsubscribeSuccessful = false;
            }
        }
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.isClient = this.authService.hasClientPrivileges();
        if (!this.isAdmin && this.isClient) {
            this.isClientSubscribedToNewsLetter();
        }
        if (this.isUnsubscribeSuccessful === false) {
            this.unsubscribeErrorMessage = "Unsubscribe unsuccessful";
        }
    }

    ngAfterViewInit(): void {
        if (!this.isAdmin) {
            this.popupModalService.setModal(this.subscribePopupName, this.subscribeSuccessPopup);
            this.popupModalService.setModal(this.unsubscribePopupName, this.unsubscribeSuccessPopup);
        }
        if (this.isUnsubscribeSuccessful) {
            this.popupModalService.openPopup(this.unsubscribePopupName);
        }
    }

    redirectToRegister() {
        this.router.navigate(['/register']);
    }

    redirectToLogin() {
        this.router.navigate(['/login']);
    }

    onNavigateToAbout() {
        this.router.navigate(['/site/about']);
    }

    onSubmit(form: NgForm) {
        if (form.form.invalid) {
            this.errorMessage = "Invalid data specified";
            return;
        }
        this.errorMessage = null;

        this.http.post(
            'http://localhost:8080/api/mailinglist/subscribe',
            form.form.value.email,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.subscribePopupName);
                },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    isClientSubscribedToNewsLetter() {
        this.http.post(
            'http://localhost:8080/api/mailinglist/client/check_subscription',
            null,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData: boolean) => { this.isClientSubscribed = responseData },
                error: (error) => { console.log("Error checking mailing list subscription") },
                complete: () => { }
            });
    }

    clientSubscribeNewsLetter() {
        this.http.post(
            'http://localhost:8080/api/mailinglist/client/subscribe',
            null,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.subscribePopupName);
                },
                error: (error) => { console.log("Error subscribing to mailing list") },
                complete: () => { }
            });
    }

    clientUnsubscribeNewsLetter() {
        this.http.post(
            'http://localhost:8080/api/mailinglist/client/unsubscribe',
            null,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.unsubscribePopupName);
                },
                error: (error) => { console.log("Error unsubscribing from mailing list") },
                complete: () => { }
            });
    }

    closePopup(name: string) {
        this.popupModalService.closePopup(name);
        window.location.reload();
    }

    ngOnDestroy(): void {
        if (!this.isAdmin) {
            this.popupModalService.unsetModal(this.subscribePopupName);
            this.popupModalService.unsetModal(this.unsubscribePopupName);
        }
    }

}
