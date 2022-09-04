import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-news-detail',
    templateUrl: './news-detail.component.html',
    styleUrls: ['./news-detail.component.css']
})
export class NewsDetailComponent implements OnInit {

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

    setUpComponent() {
        this.route.queryParams
            .subscribe(params => {
                this.newsId = params.id;
            }
            );
        this.getNews();
        this.getLatestNews();
    }

    getNews() {
        if (!this.newsId) {
            this.router.navigate(['/site/news']);
            return;
        }

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
        if (!this.newsId) {
            this.router.navigate(['/site/news']);
            return;
        }

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

}
