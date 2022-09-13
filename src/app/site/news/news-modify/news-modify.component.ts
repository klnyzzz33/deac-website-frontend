import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-news-modify',
    templateUrl: './news-modify.component.html',
    styleUrls: ['./news-modify.component.css']
})
export class NewsModifyComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "feedback";

    errorMessage = null;

    descriptionRowCount = 3;

    contentRowCount = 7;

    newsId: number;

    newsDetails: {
        newsId: number,
        title: string,
        description: string,
        content: string,
        indexImageUrl: string,
        author: string,
        createDate: string,
        lastModified: {
            modifyDate: string,
            modifyAuthor: string
        }
    } = {
            newsId: 0,
            title: "",
            description: "",
            content: "",
            indexImageUrl: "",
            author: "",
            createDate: "",
            lastModified: null
        };

    title = "";

    description = "";

    content = "";

    indexImageUrl = "";

    indexImage: File = null;

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private popupModalService: PopupModalService) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.newsId = params.id;
            }
            );
        if (!this.newsId) {
            this.router.navigate(['/site/admin/news/create']);
            return;
        }
        this.onResize(null);
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
        this.getNews();
    }

    getNews() {
        let params = new HttpParams().set("id", this.newsId);
        this.http.get(
            'http://localhost:8080/api/news/open',
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData: {
                    newsId: number,
                    title: string,
                    description: string,
                    content: string,
                    indexImageUrl: string,
                    author: string,
                    createDate: string,
                    lastModified: {
                        modifyDate: string,
                        modifyAuthor: string
                    }
                }) => {
                    this.newsDetails = responseData;
                    this.title = responseData.title;
                    this.description = responseData.description;
                    this.content = responseData.content;
                    this.indexImageUrl = responseData.indexImageUrl;
                },
                error: (error) => {
                    console.log("Error getting news details");
                    this.router.navigate(['/site/admin/news/create']);
                },
                complete: () => { }
            });
    }

    onSubmit(form: NgForm) {
        let data = form.form.value;
        data["newsId"] = this.newsDetails.newsId;
        if (form.form.invalid) {
            this.errorMessage = "Invalid data specified";
            return;
        }
        if (this.indexImage) {
            this.uploadImage()
                .subscribe({
                    next: (responseData: { message: string }) => {
                        data["indexImageUrl"] = responseData.message;
                        this.modifyNews(data);
                    },
                    error: (error) => { this.errorMessage = error.error },
                    complete: () => { }
                });
        } else {
            this.modifyNews(data);
        }
    }

    onUploadImage(event) {
        this.indexImage = event.target.files[0];
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

    modifyNews(data) {
        this.http.post(
            'http://localhost:8080/api/admin/news/update',
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
