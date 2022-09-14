import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-memberships-page-count',
    templateUrl: './memberships-page-count.component.html',
    styleUrls: ['./memberships-page-count.component.css']
})
export class MembershipsPageCountComponent implements OnInit {

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
        if (!localStorage.getItem("membershipsPageCounter")) {
            localStorage.setItem("membershipsPageCounter", "1");
        }
        this.currentPage = Number(localStorage.getItem("membershipsPageCounter"));
        this.currentPageChangeEvent.emit(this.currentPage);
        this.getNumberOfPages();
    }

    getNumberOfPages() {
        this.http.get(
            'http://localhost:8080/api/admin/memberships/count',
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
        localStorage.setItem("membershipsPageCounter", event.target.innerText);
        this.currentPage = Number(event.target.innerText);
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit(this.currentPage);
    }

    onSwitchPagesWithArrow(value: number) {
        localStorage.setItem("membershipsPageCounter", (this.currentPage + value).toString());
        this.currentPage = this.currentPage + value;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit(this.currentPage);
    }

}
