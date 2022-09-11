import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-news-create',
    templateUrl: './news-create.component.html',
    styleUrls: ['./news-create.component.css']
})
export class NewsCreateComponent implements AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "feedback";

    errorMessage = null;

    title = "";

    description = "";

    content = "";

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) { }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
    }

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
                next: (responseData) => {
                    this.popupModalService.openPopup(this.popupName);
                },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    onRedirectToRecentNews() {
        this.router.navigate(['/site/news']);
    }

    closePopup() {
        this.popupModalService.closePopup(this.popupName);
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
