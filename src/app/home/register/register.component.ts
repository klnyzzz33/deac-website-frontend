import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements AfterViewInit {

    errorMessage = null;

    username = "";

    email = "";

    password = "";

    password_confirm = "";


    @ViewChild("popup") popup: PopupModalComponent;

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) { }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popup);
    }

    onSubmit(form: NgForm) {
        let data = form.form.value;
        data["roles"] = ["ROLE_CLIENT"];

        if (form.form.invalid) {
            this.errorMessage = "Registration failed";
            return;
        }

        this.http.post(
            'http://localhost:8080/api/user/register',
            data,
            { responseType: 'json' }
        )
            .subscribe({
                next: (responseData) => { this.popupModalService.openPopup() },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    onBack() {
        this.router.navigate(['']);
    }

    onLogin() {
        this.popupModalService.closePopup();
        this.router.navigate(['login']);
    }

}
