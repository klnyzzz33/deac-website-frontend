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

    authorFilter: string = "";

    constructor(private http: HttpClient, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.authorFilter = params.author;
            });
        this.setUpComponent();
    }

    setUpComponent() {
        if (!localStorage.getItem("pageCounter")) {
            localStorage.setItem("pageCounter", "1");
        }
        this.currentPage = Number(localStorage.getItem("pageCounter"));
        this.getNumberOfPages();
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
        this.currentPageChangeEvent.emit({ currentPage: this.currentPage, authorFilter: this.authorFilter });
    }

    onSwitchPagesWithArrow(value: number) {
        localStorage.setItem("pageCounter", (this.currentPage + value).toString());
        this.currentPage = this.currentPage + value;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit({ currentPage: this.currentPage, authorFilter: this.authorFilter });
    }

    onGoToFirstPage() {
        localStorage.setItem("pageCounter", "1");
        this.currentPage = 1;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit({ currentPage: this.currentPage, authorFilter: this.authorFilter });
    }

    onGoToLastPage() {
        localStorage.setItem("pageCounter", this.numberOfPages.toString());
        this.currentPage = this.numberOfPages;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit({ currentPage: this.currentPage, authorFilter: this.authorFilter });
    }

}
