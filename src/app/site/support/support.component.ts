import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { myAnimations } from 'src/app/shared/animations/animations';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from '../auth/auth.service';
import { PageCountComponent } from '../news/news-list/page-count/page-count.component';

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.css'],
    animations: [
        myAnimations.slideInList,
        myAnimations.slideIn
    ]
})
export class SupportComponent implements OnInit {

    @ViewChild("pagecount") pagecount: PageCountComponent;

    ticketList: {
        ticketId: number,
        title: string,
        content: string,
        issuerName: string,
        createDate: string,
        closed: boolean
    }[] = [];

    currentPage: number = 1;

    currentPageSubject = new Subject<number>();

    currentPageChangeSubscription = new Subscription();

    entriesPerPage: number = 10;

    isAdmin = false;

    constructor(private http: HttpClient, private router: Router, private authService: AuthService, private popupModalService: PopupModalService) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.currentPageChangeSubscription = this.currentPageSubject.subscribe({
            next: (val) => {
                this.getTickets();
            }
        });
    }

    setCurrentPage(currentPage: number) {
        this.scrollToTop();
        this.currentPage = currentPage;
        this.currentPageSubject.next(this.currentPage);
    }

    scrollToTop() {
        document.body.scrollTo(0, 0);
    }

    getTickets() {
        let params = new HttpParams().set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage);
        let url = this.isAdmin ? "http://localhost:8080/api/admin/support/ticket/list" : "http://localhost:8080/api/support/ticket/list";
        this.http.post(
            url,
            null,
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData: {
                    ticketId: number,
                    title: string,
                    content: string,
                    issuerName: string,
                    createDate: string,
                    closed: boolean
                }[]) => {
                    this.ticketList = responseData;
                },
                error: (error) => { console.log("Error listing tickets") },
                complete: () => { }
            });
    }

    onGetTicketDetails(id: number) {
        this.router.navigate(['/site/support/ticket'], {
            queryParams: {
                id: id
            }
        });
    }

    onNavigateToCreateTicket() {
        this.router.navigate(['/site/support/ticket/create']);
    }

}
