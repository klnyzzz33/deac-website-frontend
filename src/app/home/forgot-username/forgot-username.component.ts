import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-forgot-username',
    templateUrl: './forgot-username.component.html',
    styleUrls: ['./forgot-username.component.css']
})
export class ForgotUsernameComponent implements AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "feedback";

    errorMessage = null;

    email = "";

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) { }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
    }

    onSubmit(form: NgForm) {
        let data = form.form.value;

        if (form.form.invalid) {
            this.errorMessage = "Username reset failed";
            return;
        }

        this.http.post(
            'http://localhost:8080/api/user/forgot_username',
            data.email,
            { responseType: 'json' }
        )
            .subscribe({
                next: (responseData) => { this.popupModalService.openPopup(this.popupName) },
                error: (error) => { this.errorMessage = error.error },
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
