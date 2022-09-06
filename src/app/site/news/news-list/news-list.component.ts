import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/site/auth/auth.service';
import { PageCountComponent } from './page-count/page-count.component';

@Component({
    selector: 'app-news',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.css']
})
export class NewsListComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("pagecount") pagecount: PageCountComponent;

    @ViewChildren("li") elements: QueryList<any>;

    isAdmin = false;

    isEditMode = false;

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

    constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

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
        this.isEditMode = !this.isEditMode;
    }

    ngOnDestroy(): void {
        this.elementsChangeSubscription.unsubscribe();
        this.currentPageChangeSubscription.unsubscribe();
    }

}
