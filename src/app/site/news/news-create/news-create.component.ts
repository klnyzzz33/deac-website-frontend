import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
  selector: 'app-news-create',
  templateUrl: './news-create.component.html',
  styleUrls: ['./news-create.component.css']
})
export class NewsCreateComponent {

    popupName = "feedback";

    errorMessage = null;

    username = "";

    email = "";

    password = "";

    password_confirm = "";

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) { }

    ngAfterViewInit(): void {
    }

    onSubmit(form: NgForm) {
        let data = form.form.value;
        data["roles"] = ["CLIENT"];

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
                next: (responseData) => { this.popupModalService.openPopup(this.popupName) },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    onBack() {
        this.router.navigate(['']);
    }

    onLogin() {
        this.popupModalService.closePopup(this.popupName);
        this.router.navigate(['login']);
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
