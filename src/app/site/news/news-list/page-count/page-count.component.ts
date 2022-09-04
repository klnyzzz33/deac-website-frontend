import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

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

    @Output() currentPageChangeEvent = new EventEmitter<number>();

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.setUpComponent();
    }

    setUpComponent() {
        if (!localStorage.getItem("pageCounter")) {
            localStorage.setItem("pageCounter", "1");
        }
        this.currentPage = Number(localStorage.getItem("pageCounter"));
        this.currentPageChangeEvent.emit(this.currentPage);
        this.getNumberOfPages();
    }

    getNumberOfPages() {
        this.http.get(
            'http://localhost:8080/api/news/count',
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData: number) => {
                    this.numberOfEntries = responseData;
                    this.numberOfPages = Math.ceil(this.numberOfEntries / this.entriesPerPage);
                    this.pagesShown = this.createRange();
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
        this.currentPageChangeEvent.emit(this.currentPage);
    }

    onSwitchPagesWithArrow(value: number) {
        localStorage.setItem("pageCounter", (this.currentPage + value).toString());
        this.currentPage = this.currentPage + value;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit(this.currentPage);
    }

}
