import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-page-count',
    templateUrl: './page-count.component.html',
    styleUrls: ['./page-count.component.css']
})
export class PageCountComponent implements OnInit {

    numberOfEntries: number = 0;

    entriesPerPage: number = 10;

    numberOfPages: number = 1;

    currentPage: number = 1;

    pagesShown: any[] = new Array();

    @Output() currentPageChangeEvent = new EventEmitter<{
        currentPage: number,
        authorFilter: string
    }>();

    @Output() searchCurrentPageChangeEvent = new EventEmitter<{
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
    }>();

    authorFilter: string = "";

    searchTerm: string = "";

    constructor(private http: HttpClient, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.authorFilter = params.author;
                this.searchTerm = params.search;
            });
        this.setUpComponent();
    }

    setUpComponent() {
        if (!localStorage.getItem("pageCounter")) {
            localStorage.setItem("pageCounter", "1");
        }
        this.currentPage = Number(localStorage.getItem("pageCounter"));
        if (!this.searchTerm) {
            this.getNumberOfPages();
        } else {
            this.getSearchResults();
        }
    }

    getNumberOfPages() {
        let url = "http://localhost:8080/api/news/count";
        let params = new HttpParams();
        if (this.authorFilter) {
            url = "http://localhost:8080/api/news/count/author";
            params = params.set("author", this.authorFilter);
        }
        this.http.get(
            url,
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData: number) => {
                    this.numberOfEntries = responseData;
                    this.numberOfPages = Math.ceil(this.numberOfEntries / this.entriesPerPage);
                    if (this.currentPage > this.numberOfPages) {
                        this.currentPage = Math.max(1, this.numberOfPages);
                        localStorage.setItem("pageCounter", this.currentPage.toString());
                    }
                    this.pagesShown = this.createRange();
                    this.currentPageChangeEvent.emit({ currentPage: this.currentPage, authorFilter: this.authorFilter });
                },
                error: (error) => { console.log("Error getting number of pages") },
                complete: () => { }
            });
    }

    getSearchResults() {
        let params = new HttpParams().set("title", this.searchTerm).set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage);
        this.http.get(
            "http://localhost:8080/api/news/search",
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData: {
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
                    }[],
                    numberOfResults: number
                }) => {
                    this.numberOfEntries = responseData.numberOfResults;
                    this.numberOfPages = Math.ceil(this.numberOfEntries / this.entriesPerPage);
                    if (this.currentPage > this.numberOfPages) {
                        this.currentPage = Math.max(1, this.numberOfPages);
                        localStorage.setItem("pageCounter", this.currentPage.toString());
                    }
                    this.pagesShown = this.createRange();
                    this.searchCurrentPageChangeEvent.emit({ currentPage: this.currentPage, results: responseData.results });
                },
                error: (error) => { console.log("Error getting search results") },
                complete: () => { }
            });
    }

    createRange() {
        let result = new Array();
        let lowerBound = 1;
        let higherBound = this.numberOfPages;
        if (this.currentPage >= 3) {
            lowerBound = this.currentPage - 2;
        }
        if (this.currentPage <= this.numberOfPages - 2) {
            higherBound = this.currentPage + 2;
        }
        for (let i = lowerBound; i <= higherBound; i++) {
            result.push(i);
        }
        return result;
    }

    onSwitchPages(event: any) {
        localStorage.setItem("pageCounter", event.target.innerText);
        this.currentPage = Number(event.target.innerText);
        this.pagesShown = this.createRange();
        if (!this.searchTerm) {
            this.currentPageChangeEvent.emit({ currentPage: this.currentPage, authorFilter: this.authorFilter });
        } else {
            this.getSearchResults();
        }
    }

    onSwitchPagesWithArrow(value: number) {
        localStorage.setItem("pageCounter", (this.currentPage + value).toString());
        this.currentPage = this.currentPage + value;
        this.pagesShown = this.createRange();
        if (!this.searchTerm) {
            this.currentPageChangeEvent.emit({ currentPage: this.currentPage, authorFilter: this.authorFilter });
        } else {
            this.getSearchResults();
        }
    }

    onGoToFirstPage() {
        localStorage.setItem("pageCounter", "1");
        this.currentPage = 1;
        this.pagesShown = this.createRange();
        if (!this.searchTerm) {
            this.currentPageChangeEvent.emit({ currentPage: this.currentPage, authorFilter: this.authorFilter });
        } else {
            this.getSearchResults();
        }
    }

    onGoToLastPage() {
        localStorage.setItem("pageCounter", this.numberOfPages.toString());
        this.currentPage = this.numberOfPages;
        this.pagesShown = this.createRange();
        if (!this.searchTerm) {
            this.currentPageChangeEvent.emit({ currentPage: this.currentPage, authorFilter: this.authorFilter });
        } else {
            this.getSearchResults();
        }
    }

}
