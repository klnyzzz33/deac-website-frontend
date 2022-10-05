import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { HomeService } from '../home.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    @ViewChild("button") button: ElementRef;

    @ViewChild("spinner") spinner: ElementRef;

    @ViewChild("buttontext") buttonText: ElementRef;

    popupName = "feedback";

    errorMessage = null;

    password = "";

    password_confirm = "";

    token = "";

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private popupModalService: PopupModalService, private homeService: HomeService) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.token = params.token;
            }
            );
        if (!this.token) {
            this.router.navigate(['home']);
        }
    }

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

        if (form.form.invalid || !this.token) {
            this.errorMessage = "Password reset failed";
            return;
        }
        this.errorMessage = null;

        this.homeService.onLoadingState.next({
            isLoading: true,
            elements: this.homeService.elements
        });
        this.http.post(
            'http://localhost:8080/api/user/reset_password',
            { token: this.token, password: data.password },
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

    onCancel() {
        this.router.navigate(['home']);
    }

    onLogin() {
        this.popupModalService.closePopup(this.popupName);
        this.router.navigate(['login']);
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
