import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-support-page-count',
    templateUrl: './support-page-count.component.html',
    styleUrls: ['./support-page-count.component.css']
})
export class SupportPageCountComponent implements OnInit {

    numberOfEntries: number = 0;

    entriesPerPage: number = 10;

    numberOfPages: number = 1;

    currentPage: number = 1;

    pagesShown: any[] = new Array();

    @Output() currentPageChangeEvent = new EventEmitter<{
        currentPage: number,
        filter: boolean,
        filterLabel: string
    }>();

    isAdmin = false;

    filter: boolean = null;

    filterLabel: string = "";

    constructor(private http: HttpClient, private authService: AuthService) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.setUpComponent();
    }

    setUpComponent(searchTerm = null) {
        if (!localStorage.getItem("ticketsPageCounter")) {
            localStorage.setItem("ticketsPageCounter", "1");
        }
        this.currentPage = Number(localStorage.getItem("ticketsPageCounter"));
        this.filterLabel = localStorage.getItem("filterTicketStatus");
        switch (this.filterLabel) {
            case null:
                this.filter = null;
                break;
            case "Open":
                this.filter = false;
                break;
            default:
                this.filter = true;
        }
        this.currentPageChangeEvent.emit({ currentPage: this.currentPage, filter: this.filter, filterLabel: this.filterLabel });
        if (!searchTerm) {
            this.getNumberOfPages();
        } else {
            this.setupSearch(searchTerm);
        }
    }

    getNumberOfPages() {
        let url = this.isAdmin ? "http://localhost:8080/api/admin/support/ticket/count" : "http://localhost:8080/api/support/ticket/count";
        let params = new HttpParams();
        if (this.filter != null) {
            params = params.set("filterTicketStatus", this.filter);
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
                    this.pagesShown = this.createRange();
                },
                error: (error) => {
                    console.log("Error getting number of pages");
                    localStorage.setItem("ticketsPageCounter", "1");
                    this.numberOfPages = 0;
                    this.pagesShown = this.createRange();
                },
                complete: () => { }
            });
    }

    setupSearch(searchTerm: string) {
        let params = new HttpParams().set("searchTerm", searchTerm);
        this.http.get(
            "http://localhost:8080/api/admin/support/ticket/search/count",
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
                error: (error) => { console.log("Error getting number of search results") },
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
        localStorage.setItem("ticketsPageCounter", event.target.innerText);
        this.currentPage = Number(event.target.innerText);
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit({ currentPage: this.currentPage, filter: this.filter, filterLabel: this.filterLabel });
    }

    onSwitchPagesWithArrow(value: number) {
        localStorage.setItem("ticketsPageCounter", (this.currentPage + value).toString());
        this.currentPage = this.currentPage + value;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit({ currentPage: this.currentPage, filter: this.filter, filterLabel: this.filterLabel });
    }

    onGoToFirstPage() {
        localStorage.setItem("ticketsPageCounter", "1");
        this.currentPage = 1;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit({ currentPage: this.currentPage, filter: this.filter, filterLabel: this.filterLabel });
    }

    onGoToLastPage() {
        localStorage.setItem("ticketsPageCounter", this.numberOfPages.toString());
        this.currentPage = this.numberOfPages;
        this.pagesShown = this.createRange();
        this.currentPageChangeEvent.emit({ currentPage: this.currentPage, filter: this.filter, filterLabel: this.filterLabel });
    }

}
