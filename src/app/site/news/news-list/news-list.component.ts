import { animate, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from 'src/app/site/auth/auth.service';
import { PageCountComponent } from './page-count/page-count.component';

@Component({
    selector: 'app-news',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.css'],
    animations: [
        trigger("toggleOnOff", [
            transition(':enter', [
                style({
                    opacity: 0,
                }),
                animate('1s ease-in',
                    style({
                        opacity: 1,
                    }))
            ]),
            transition(':leave', [
                style({
                    opacity: 1,
                }),
                animate('1s ease-in',
                    style({
                        opacity: 0,
                    }))
            ])
        ])
    ]
})
export class NewsListComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    @ViewChild("pagecount") pagecount: PageCountComponent;

    @ViewChildren("li") elements: QueryList<any>;

    popupName = "confirm";

    isAdmin = false;

    isEditMode = false;

    isMultiDeleteMode = false;

    markedForDelete: Number = null;

    markedForMultiDelete = new Map<Number, boolean>();

    elementsChangeSubscription = new Subscription();

    newsList: {
        newsId: Number,
        title: String,
        description: String,
        content: String,
        author: String,
        createDate: Number,
        lastModified: {
            modifyDate: Number,
            modifyAuthor: String
        }
    }[] = [];

    currentPage: number = 1;

    currentPageSubject = new Subject<number>();

    currentPageChangeSubscription = new Subscription();

    entriesPerPage: number = 10;

    constructor(private http: HttpClient, private router: Router, private authService: AuthService, private popupModalService: PopupModalService) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.currentPageChangeSubscription = this.currentPageSubject.subscribe({
            next: (val) => {
                this.getNews();
            }
        });
    }

    setCurrentPage(currentPage: number) {
        this.currentPage = currentPage;
        this.currentPageSubject.next(this.currentPage);
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
        this.elementsChangeSubscription = this.elements.changes.subscribe(li => {
            this.onResize(null);
        });
    }

    getNews() {
        let params = new HttpParams().set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage);
        this.http.get(
            'http://localhost:8080/api/news/list',
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData: {
                    newsId: Number,
                    title: String,
                    description: String,
                    content: String,
                    author: String,
                    createDate: Number,
                    lastModified: {
                        modifyDate: Number,
                        modifyAuthor: String
                    }
                }[]) => {
                    this.newsList = responseData;
                    this.markedForDelete = null;
                    this.newsList.forEach(news => {
                        this.markedForMultiDelete.set(news.newsId, false);
                    });
                },
                error: (error) => { console.log("Error listing news") },
                complete: () => { }
            });
    }

    onOpenNews(newsId: number, title: String) {
        this.router.navigate(['/site/news', title], {
            queryParams: {
                id: newsId
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth > 576 && window.innerWidth <= 992) {
            this.setTitleMargins("medium");
        } else {
            this.setTitleMargins("large");
        }
    }

    setTitleMargins(screenSize: String) {
        this.newsList.forEach(news => {
            let id = "news-title-" + news.newsId;
            let element = document.getElementById(id);
            let height = screenSize == "medium" ? element.offsetHeight : 0;
            element.style.marginBottom = "-" + height + "px";
        });
    }

    toggleEditMode() {
        this.isEditMode = this.isAdmin && !this.isEditMode;
        if (!this.isMultiDeleteMode) {
            this.markedForDelete = null;
        }
    }

    toggleMultiDeleteMode() {
        this.markedForDelete = null;
        this.isMultiDeleteMode = this.isEditMode && !this.isMultiDeleteMode;
        if (!this.isMultiDeleteMode) {
            this.newsList.forEach(news => {
                this.markedForMultiDelete.set(news.newsId, false);
            });
        }
    }

    onDeleteNews(newsId: Number) {
        this.markedForDelete = newsId;
        this.onDeleteSelectedNews();
    }

    onDeleteSelectedNews() {
        this.popupModalService.openPopup(this.popupName);
    }

    onConfirm() {
        let request: Observable<Object>;
        if (!this.isMultiDeleteMode) {
            request = this.http.post(
                'http://localhost:8080/api/admin/news/delete',
                this.markedForDelete,
                {
                    withCredentials: true,
                }
            );
        } else {
            let data = [];
            this.markedForMultiDelete.forEach((value, key) => {
                if (value) {
                    data.push(key);
                }
            });
            request = this.http.post(
                'http://localhost:8080/api/admin/news/delete_selected',
                data,
                {
                    withCredentials: true,
                }
            );
        }
        request.subscribe({
            next: (responseData: { message: String }) => { window.location.reload() },
            error: (error) => { console.log("Error deleting news") },
            complete: () => { }
        });
    }

    closePopup() {
        this.markedForDelete = null;
        this.newsList.forEach(news => {
            this.markedForMultiDelete.set(news.newsId, false);
        });
        this.popupModalService.closePopup(this.popupName);
    }

    ngOnDestroy(): void {
        this.elementsChangeSubscription.unsubscribe();
        this.currentPageChangeSubscription.unsubscribe();
        this.popupModalService.unsetModal(this.popupName);
    }

}
