import { HttpClient, HttpParams } from '@angular/common/http';
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

    setUpComponent(search = false) {
        if (!localStorage.getItem("membershipsPageCounter")) {
            localStorage.setItem("membershipsPageCounter", "1");
        }
        this.currentPage = Number(localStorage.getItem("membershipsPageCounter"));
        this.currentPageChangeEvent.emit(this.currentPage);
        if (!search) {
            this.getNumberOfPages();
        } else {
            this.setupSearch();
        }
    }

    setupSearch() {
        this.numberOfEntries = 1;
        this.numberOfPages = 1;
        this.pagesShown = this.createRange();
    }

    getNumberOfPages() {
        let filter: boolean;
        switch (localStorage.getItem("filterMonthlyFee")) {
            case null:
                filter = null;
                break;
            case "Paid":
                filter = true;
                break;
            default:
                filter = false;
        }
        let params = new HttpParams();
        if (filter != null) {
            params = params.set("filterHasPaid", filter);
        }
        this.http.get(
            'http://localhost:8080/api/admin/memberships/count',
            {
                withCredentials: true,
                params: params
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

    onGoToFirstPage() {
        localStorage.setItem("membershipsPageCounter", "1");
        this.currentPage = 1;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit(this.currentPage);
    }

    onGoToLastPage() {
        localStorage.setItem("membershipsPageCounter", this.numberOfPages.toString());
        this.currentPage = this.numberOfPages;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit(this.currentPage);
    }

}
