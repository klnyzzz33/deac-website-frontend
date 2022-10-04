import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from 'src/app/site/auth/auth.service';
import { HomeService } from '../home.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    @ViewChild("button") button: ElementRef;

    @ViewChild("spinner") spinner: ElementRef;

    @ViewChild("buttontext") buttonText: ElementRef;

    popupName = "feedback";

    errorMessage = null;

    username = "";

    password = "";

    isVerifiedSuccessful = null;

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService, private authService: AuthService, private homeService: HomeService) {
        let currentNavigation = this.router.getCurrentNavigation();
        if (currentNavigation != null && currentNavigation.extras["state"]) {
            if (currentNavigation.extras.state["isVerifiedSuccessful"]) {
                this.isVerifiedSuccessful = true;
            } else if (currentNavigation.extras.state.isVerifiedSuccessful === false) {
                this.isVerifiedSuccessful = false;
            }
        }
    }

    ngOnInit(): void {
        if (this.isVerifiedSuccessful === false) {
            this.errorMessage = "Verification failed";
        }
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
        this.homeService.setElements({
            button: this.button,
            spinner: this.spinner,
            buttonText: this.buttonText
        });
        if (this.isVerifiedSuccessful) {
            this.popupModalService.openPopup(this.popupName);
        }
    }

    onSubmit(form: NgForm) {
        let data = form.form.value;

        if (form.form.invalid) {
            this.errorMessage = "Login failed";
            return;
        }

        this.homeService.onLoadingState.next({
            isLoading: true,
            elements: this.homeService.elements
        });
        this.http.post(
            'http://localhost:8080/api/user/auth/login',
            data,
            {
                responseType: 'json',
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData: { message: string }) => {
                    localStorage.clear();
                    this.authService.setAuthorities(JSON.parse(responseData.message));
                    this.router.navigate(['/site/home']);
                },
                error: (error) => {
                    this.errorMessage = error.error;
                    this.homeService.onLoadingState.next({
                        isLoading: false,
                        elements: this.homeService.elements
                    });
                },
                complete: () => { }
            });
    }

    onForgotPassword() {
        this.router.navigate(['forgot-password']);
    }

    onBack() {
        this.router.navigate(['home']);
    }

    onClose() {
        this.popupModalService.closePopup(this.popupName);
        this.router.navigate(['login']);
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
