import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { myAnimations } from 'src/app/shared/animations/animations';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from 'src/app/site/auth/auth.service';
import { PageCountComponent } from './page-count/page-count.component';

@Component({
    selector: 'app-news',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.css'],
    animations: [
        myAnimations.appear,
        myAnimations.toggleOnOff,
        myAnimations.slideIn,
        myAnimations.slideInList,
        myAnimations.slideInOutReverse
    ]
})
export class NewsListComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    @ViewChild("pagecount") pagecount: PageCountComponent;

    @ViewChildren("li") elements: QueryList<any>;

    @ViewChild("newspagetitle") newsPageTitle: ElementRef;

    @ViewChild("newspageinform") newsPageInform: ElementRef;

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
        indexImageUrl: String,
        author: String,
        createDate: String,
        lastModified: {
            modifyDate: String,
            modifyAuthor: String
        }
    }[] = [];

    currentPage: number = 1;

    currentPageSubject = new Subject<{
        currentPage: number,
        authorFilter: string,
        results: {
            newsId: Number,
            title: String,
            description: String,
            content: String,
            indexImageUrl: String,
            author: String,
            createDate: String,
            lastModified: {
                modifyDate: String,
                modifyAuthor: String
            }
        }[]
    }>();

    currentPageChangeSubscription = new Subscription();

    entriesPerPage: number = 10;

    authorFilter: string = null;

    searchModeOn: boolean = false;

    constructor(private http: HttpClient, private router: Router, private authService: AuthService, private popupModalService: PopupModalService, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.currentPageChangeSubscription = this.currentPageSubject.subscribe({
            next: (val) => {
                if (val.results == null) {
                    if (this.newsPageTitle && val.authorFilter) {
                        this.newsPageTitle.nativeElement.innerText = "Articles written by " + val.authorFilter;
                    }
                    this.authorFilter = val.authorFilter;
                    this.getNews(val.authorFilter);
                } else {
                    if (this.newsPageTitle) {
                        this.newsPageTitle.nativeElement.innerText = "Search results";
                    }
                    this.searchModeOn = true;
                    this.newsList = val.results;
                    this.changeDetectorRef.detectChanges();
                    if (this.newsPageInform) {
                        this.newsPageInform.nativeElement.innerText = "No results.";
                    }
                }
            }
        });
    }

    setCurrentPage(value: { currentPage: number, authorFilter: string }) {
        this.scrollToTop();
        this.currentPage = value.currentPage;
        this.currentPageSubject.next({ currentPage: this.currentPage, authorFilter: value.authorFilter, results: null });
    }

    setSearchResultsAndCurrentPage(value: {
        currentPage: number,
        results: {
            newsId: Number,
            title: String,
            description: String,
            content: String,
            indexImageUrl: String,
            author: String,
            createDate: String,
            lastModified: {
                modifyDate: String,
                modifyAuthor: String
            }
        }[]
    }) {
        this.scrollToTop();
        this.currentPage = value.currentPage;
        this.currentPageSubject.next({ currentPage: this.currentPage, authorFilter: null, results: value.results });
    }

    ngAfterViewInit(): void {
        if (this.isAdmin) {
            this.popupModalService.setModal(this.popupName, this.popup);
        }
        this.elementsChangeSubscription = this.elements.changes.subscribe(li => {
            this.onResize(null);
        });
        if (!this.searchModeOn) {
            if (this.authorFilter) {
                this.newsPageTitle.nativeElement.innerText = "Articles written by " + this.authorFilter;
            }
        } else {
            this.newsPageTitle.nativeElement.innerText = "Search results";
            if (this.newsPageInform) {
                this.newsPageInform.nativeElement.innerText = "No results.";
            }
        }
    }

    scrollToTop() {
        document.body.scrollTo(0, 0);
    }

    identify(index, item) {
        return item.newsId;
    }

    getNews(authorFilter = null) {
        let url = "http://localhost:8080/api/news/list";
        let params = new HttpParams().set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage);
        if (authorFilter) {
            url = "http://localhost:8080/api/news/list/author";
            params = params.set("author", authorFilter);
        }
        this.http.get(
            url,
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
                    indexImageUrl: String,
                    author: String,
                    createDate: String,
                    lastModified: {
                        modifyDate: String,
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
        if (!this.isMultiDeleteMode) {
            this.router.navigate(['/site/news', title], {
                queryParams: {
                    id: newsId
                }
            });
        } else {
            this.markedForMultiDelete.set(newsId, !this.markedForMultiDelete.get(newsId));
        }
    }

    onCreateNews() {
        this.router.navigate(['/site/admin/news/create']);
    }

    onEditNews(newsId: Number) {
        this.router.navigate(['/site/admin/news/edit'], {
            queryParams: {
                id: newsId
            }
        });
    }

    onSelectNewsEntry(newsId: Number) {
        return this.markedForMultiDelete.get(newsId) ? { "background-color": "gainsboro" } : {};
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
            this.newsList.forEach(news => {
                this.markedForMultiDelete.set(news.newsId, false);
            });
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
        if (this.isAdmin) {
            this.popupModalService.unsetModal(this.popupName);
        }
    }

}
