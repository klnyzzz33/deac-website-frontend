import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { myAnimations } from 'src/app/shared/animations/animations';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-news-detail',
    templateUrl: './news-detail.component.html',
    styleUrls: ['./news-detail.component.css'],
    animations: [
        myAnimations.toggleOnOff,
        myAnimations.slideIn,
        myAnimations.slideInList,
        myAnimations.appear
    ]
})
export class NewsDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild("popup") popup: PopupModalComponent;

    @ViewChildren("li") elements: QueryList<any>;

    popupName = "confirm";

    isAdmin = false;

    isEditMode = false;

    elementsChangeSubscription = new Subscription();

    newsId: number;

    newsDetails: {
        newsId: number,
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

    latestNewsEntryCount = 5;

    latestNewsList: {
        newsId: number,
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

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private authService: AuthService, private popupModalService: PopupModalService) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.setUpComponent();
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
        this.elementsChangeSubscription = this.elements.changes.subscribe(li => {
            this.onResize(null);
        });
    }

    setUpComponent() {
        this.route.queryParams
            .subscribe(params => {
                this.newsId = params.id;
            }
            );
        if (!this.newsId) {
            this.router.navigate(['/site/news']);
            return;
        }
        this.getNews();
        this.getLatestNews();
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
                }) => { this.newsDetails = responseData },
                error: (error) => {
                    console.log("Error getting news details");
                    this.router.navigate(['/site/news']);
                },
                complete: () => { }
            });
    }

    getLatestNews() {
        let params = new HttpParams().set("entriesPerPage", this.latestNewsEntryCount).set("excludedId", this.newsId);
        this.http.get(
            'http://localhost:8080/api/news/latest_excluded',
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData: {
                    newsId: number,
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
                }[]) => { this.latestNewsList = responseData },
                error: (error) => { console.log("Error getting latest news") },
                complete: () => { }
            });
    }

    onOpenNews(newsId: number, title: String) {
        this.router.navigate(['/site/news', title], {
            queryParams: {
                id: newsId
            }
        })
            .then(() => {
                window.location.reload();
            });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 992) {
            this.setTitleMargins("medium");
        } else {
            this.setTitleMargins("large");
        }
    }

    setTitleMargins(screenSize: String) {
        this.latestNewsList.forEach(news => {
            let id = "news-title-" + news.newsId;
            let element = document.getElementById(id);
            let height = screenSize == "medium" ? element.offsetHeight : 0;
            element.style.marginBottom = "-" + height + "px";
        });
    }

    onRedirectToAllNews() {
        this.router.navigate(["/site/news"]);
    }

    toggleEditMode() {
        this.isEditMode = this.isAdmin && !this.isEditMode;
    }

    onEditNews() {
        this.router.navigate(['/site/admin/news/edit'], {
            queryParams: {
                id: this.newsDetails.newsId
            }
        });
    }

    onDeleteNews() {
        this.popupModalService.openPopup(this.popupName);
    }

    onConfirm() {
        this.http.post(
            'http://localhost:8080/api/admin/news/delete',
            this.newsDetails.newsId,
            {
                withCredentials: true,
            }
        )
            .subscribe({
                next: (responseData: { message: String }) => {
                    this.router.navigate(['/site/news']);
                },
                error: (error) => { console.log("Error deleting news") },
                complete: () => { }
            });
    }

    closePopup() {
        this.popupModalService.closePopup(this.popupName);
    }

    ngOnDestroy(): void {
        this.elementsChangeSubscription.unsubscribe();
        this.popupModalService.unsetModal(this.popupName);
    }

}
