import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements AfterViewInit {

    errorMessage = null;

    email = "";

    @ViewChild("popup") popup: PopupModalComponent;

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) { }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popup);
    }

    onSubmit(form: NgForm) {
        let data = form.form.value;

        if (form.form.invalid) {
            this.errorMessage = "Password reset failed";
            return;
        }

        this.http.post(
            'http://localhost:8080/api/user/forgot',
            data.email,
            { responseType: 'json' }
        )
            .subscribe({
                next: (responseData) => { this.popupModalService.openPopup() },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    onBack() {
        this.router.navigate(['login']);
    }

    onReturn() {
        this.popupModalService.closePopup();
        this.router.navigate(['login']);
    }

}
