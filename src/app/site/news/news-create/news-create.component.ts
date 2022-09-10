import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-news-create',
    templateUrl: './news-create.component.html',
    styleUrls: ['./news-create.component.css']
})
export class NewsCreateComponent {

    popupName = "feedback";

    errorMessage = null;

    title = "";

    description = "";

    content = "";

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) { }

    onSubmit(form: NgForm) {
        let data = form.form.value;

        if (form.form.invalid) {
            this.errorMessage = "Invalid data specified";
            return;
        }

        this.http.post(
            'http://localhost:8080/api/admin/news/create',
            data,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData) => { console.log(responseData) },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
