import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { HomeService } from '../home.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    @ViewChild("button") button: ElementRef;

    @ViewChild("spinner") spinner: ElementRef;

    @ViewChild("buttontext") buttonText: ElementRef;

    popupName = "feedback";

    errorMessage = null;

    email = "";

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService, private homeService: HomeService) { }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
        this.homeService.setElements({
            button: this.button,
            spinner: this.spinner,
            buttonText: this.buttonText
        });
    }

    onSubmit(form: NgForm) {
        let data = form.form.value;

        if (form.form.invalid) {
            this.errorMessage = "Password reset failed";
            return;
        }

        this.homeService.onLoadingState.next({
            isLoading: true,
            elements: this.homeService.elements
        });
        this.http.post(
            'http://localhost:8080/api/user/forgot_password',
            data.email,
            { responseType: 'json' }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.popupName);
                    this.homeService.onLoadingState.next({
                        isLoading: false,
                        elements: this.homeService.elements
                    });
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

    onForgotUsername() {
        this.router.navigate(['forgot-username']);
    }

    onBack() {
        this.router.navigate(['login']);
    }

    onReturn() {
        this.popupModalService.closePopup(this.popupName);
        this.router.navigate(['login']);
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
