import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { MembershipsPageCountComponent } from './memberships-page-count/memberships-page-count.component';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

    @ViewChild("pagecount") pagecount: MembershipsPageCountComponent;

    membershipList: {
        username: string,
        memberSince: string,
        hasPaidMembershipFee: boolean,
        monthlyTransactionReceiptPath: string,
        enabled: boolean,
        approved: boolean
    }[] = [];

    currentPage: number = 1;

    currentPageSubject = new Subject<number>();

    currentPageChangeSubscription = new Subscription();

    entriesPerPage: number = 10;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.currentPageChangeSubscription = this.currentPageSubject.subscribe({
            next: (val) => {
                this.getMembershipEntries();
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

    getMembershipEntries() {
        let params = new HttpParams().set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage);
        this.http.get(
            'http://localhost:8080/api/admin/memberships/list',
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData: {
                    username: string,
                    memberSince: string,
                    hasPaidMembershipFee: boolean,
                    monthlyTransactionReceiptPath: string,
                    enabled: boolean,
                    approved: boolean
                }[]) => {
                    this.membershipList = responseData;
                },
                error: (error) => { console.log("Error listing memberships") },
                complete: () => { }
            });
    }

    onToggleEnabled(username: string, enabled: boolean) {
        let data = {
            username: username,
            modifiedBoolean: !enabled
        }
        this.http.post(
            'http://localhost:8080/api/admin/memberships/enable',
            data,
            {
                withCredentials: true,
            }
        )
            .subscribe({
                next: (responseData: { message: string }) => {
                    window.location.reload();
                },
                error: (error) => { console.log("Error toggling user enabled field") },
                complete: () => { }
            });
    }

    ngOnDestroy(): void {
        this.currentPageChangeSubscription.unsubscribe();
    }

}
