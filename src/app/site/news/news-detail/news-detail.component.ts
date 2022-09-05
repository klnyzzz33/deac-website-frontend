import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-news-detail',
    templateUrl: './news-detail.component.html',
    styleUrls: ['./news-detail.component.css']
})
export class NewsDetailComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChildren("li") elements: QueryList<any>;

    elementsChangeSubscription = new Subscription();

    newsId: number;

    newsDetails: {
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
    } = {
            newsId: 0,
            title: "",
            description: "",
            content: "",
            author: "",
            createDate: 0,
            lastModified: null
        };

    latestNewsEntryCount = 5;

    latestNewsList: {
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

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.setUpComponent();
    }

    ngAfterViewInit(): void {
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
                }) => { this.newsDetails = responseData },
                error: (error) => { console.log("Error getting news details") },
                complete: () => { }
            });
    }

    getLatestNews() {
        let params = new HttpParams().set("entriesPerPage", this.latestNewsEntryCount);
        this.http.get(
            'http://localhost:8080/api/news/latest',
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

    ngOnDestroy(): void {
        this.elementsChangeSubscription.unsubscribe();
    }

}
