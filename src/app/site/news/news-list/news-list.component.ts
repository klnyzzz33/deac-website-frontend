import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageCountComponent } from './page-count/page-count.component';

@Component({
    selector: 'app-news',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.css']
})
export class NewsListComponent implements AfterViewInit, OnDestroy {

    @ViewChild("pagecount") pagecount: PageCountComponent;

    @ViewChildren("li") elements: QueryList<any>;

    elementsChangeSubscription = new Subscription();

    isMediumScreen = false;

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

    entriesPerPage: number = 10;

    constructor(private http: HttpClient, private router: Router) { }

    setCurrentPage(currentPage: number) {
        this.currentPage = currentPage;
        this.ngAfterViewInit();
    }

    ngAfterViewInit(): void {
        this.elementsChangeSubscription = this.elements.changes.subscribe(li => {
            this.onResize(null);
        });
        this.getNews();
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
        if (window.innerWidth <= 992) {
            if (!this.isMediumScreen) {
                this.isMediumScreen = true;
                this.setTitleMargins("medium");
            }
        } else {
            if (this.isMediumScreen) {
                this.isMediumScreen = false;
                this.setTitleMargins("large");
            }
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

    ngOnDestroy(): void {
        this.elementsChangeSubscription.unsubscribe();
    }

}
