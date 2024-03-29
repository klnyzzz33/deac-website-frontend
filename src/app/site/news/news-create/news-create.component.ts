import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-news-create',
    templateUrl: './news-create.component.html',
    styleUrls: ['./news-create.component.css']
})
export class NewsCreateComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "feedback";

    errorMessage = null;

    descriptionRowCount = 3;

    contentRowCount = 7;

    title = "";

    description = "";

    content = "";

    indexImage: File = null;

    previewImageUrl = "";

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.onResize(null);
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
    }

    onSubmit(form: NgForm) {
        let data = form.form.value;
        if (form.form.invalid) {
            this.translate.get("site.news.create.error.create")
                .subscribe((value: string) => {
                    this.errorMessage = value;
                });
            return;
        }
        this.errorMessage = null;
        if (this.indexImage) {
            this.uploadImage()
                .subscribe({
                    next: (responseData: { message: string }) => {
                        data["indexImageUrl"] = responseData.message;
                        this.createNews(data);
                    },
                    error: (error) => { this.errorMessage = error.error },
                    complete: () => { }
                });
        } else {
            this.createNews(data);
        }
    }

    onUploadImage(event) {
        if (event.target.files && event.target.files[0]) {
            this.indexImage = event.target.files[0];
            let reader = new FileReader();
            reader.onload = (r) => {
                this.previewImageUrl = reader.result as string;
            }
            reader.readAsDataURL(this.indexImage);
        } else {
            this.indexImage = null;
        }
    }

    uploadImage() {
        let data = new FormData();
        data.append("indexImage", this.indexImage, this.indexImage.name);
        return this.http.post(
            'http://localhost:8080/api/admin/news/upload_image',
            data,
            {
                withCredentials: true,
                responseType: 'json'
            }
        );
    }

    createNews(data) {
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

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 991) {
            this.descriptionRowCount = 5;
            this.contentRowCount = 12;
        } else {
            this.descriptionRowCount = 3;
            this.contentRowCount = 7;
        }
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
