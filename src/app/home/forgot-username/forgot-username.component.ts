import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { HomeService } from '../home.service';

@Component({
    selector: 'app-forgot-username',
    templateUrl: './forgot-username.component.html',
    styleUrls: ['./forgot-username.component.css']
})
export class ForgotUsernameComponent implements AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    @ViewChild("button") button: ElementRef;

    @ViewChild("spinner") spinner: ElementRef;

    @ViewChild("buttontext") buttonText: ElementRef;

    popupName = "feedback";

    errorMessage = null;

    email = "";

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService, private homeService: HomeService, private translate: TranslateService) { }

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
            this.translate.get("home.forgotusername.error.forgot")
                .subscribe((value: string) => {
                    this.errorMessage = value;
                });
            return;
        }
        this.errorMessage = null;

        this.homeService.onLoadingState.next({
            isLoading: true,
            elements: this.homeService.elements
        });
        this.http.post(
            'http://localhost:8080/api/user/forgot_username',
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
