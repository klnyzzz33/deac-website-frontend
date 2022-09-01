import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PageCountComponent } from './page-count/page-count.component';

@Component({
    selector: 'app-news',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.css']
})
export class NewsListComponent {

    @ViewChild("pagecount") pagecount: PageCountComponent;

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
                }[]) => { this.newsList = responseData },
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

}
