import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from 'src/app/site/auth/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "feedback";

    errorMessage = null;

    username = "";

    password = "";

    isVerifiedSuccessful = null;

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService, private authService: AuthService) {
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
                    this.router.navigate(['/site/dashboard']);
                },
                error: (error) => { this.errorMessage = error.error },
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
