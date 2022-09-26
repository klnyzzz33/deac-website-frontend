import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { myAnimations } from 'src/app/shared/animations/animations';
import { MembershipsPageCountComponent } from './memberships-page-count/memberships-page-count.component';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css'],
    animations: [
        myAnimations.slideInList,
        myAnimations.slideIn
    ]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("pagecount") pagecount: MembershipsPageCountComponent;

    @ViewChild("monthlyfeefilterlabel") monthlyFeeFilterLabelElement: ElementRef;

    membershipList: {
        username: string,
        memberSince: string,
        hasPaidMembershipFee: boolean,
        enabled: boolean,
        approved: boolean,
        hasReceipts: boolean
    }[] = [];

    currentPage: number = 1;

    currentPageSubject = new Subject<number>();

    currentPageChangeSubscription = new Subscription();

    entriesPerPage: number = 10;

    monthlyFeeFilter: boolean = null;

    monthlyFeeFilterLabel: string = "";

    constructor(private http: HttpClient, private router: Router, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.currentPageChangeSubscription = this.currentPageSubject.subscribe({
            next: (val) => {
                let filter: boolean;
                let item = localStorage.getItem("filterMonthlyFee");
                switch (item) {
                    case null:
                        filter = null;
                        break;
                    case "Paid":
                        filter = true;
                        break;
                    default:
                        filter = false;
                }
                this.monthlyFeeFilter = filter;
                this.monthlyFeeFilterLabel = item;
                this.changeDetectorRef.detectChanges();
                if (this.monthlyFeeFilterLabelElement) {
                    this.monthlyFeeFilterLabelElement.nativeElement.innerText = this.monthlyFeeFilterLabel;
                }
                this.getMembershipEntries(filter);
            }
        });
    }

    setCurrentPage(currentPage: number) {
        this.scrollToTop();
        this.currentPage = currentPage;
        this.currentPageSubject.next(this.currentPage);
    }

    ngAfterViewInit(): void {
        if (this.monthlyFeeFilter != null) {
            this.monthlyFeeFilterLabelElement.nativeElement.innerText = this.monthlyFeeFilterLabel;
        }
    }

    scrollToTop() {
        document.body.scrollTo(0, 0);
    }

    getMembershipEntries(hasPaid: boolean) {
        let params = new HttpParams().set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage);
        if (hasPaid != null) {
            params = params.set("filterHasPaid", hasPaid);
        }
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
                    enabled: boolean,
                    approved: boolean,
                    hasReceipts: boolean
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

    onToggleApproved(username: string, approved: boolean) {
        let data = {
            username: username,
            modifiedBoolean: !approved
        }
        this.http.post(
            'http://localhost:8080/api/admin/memberships/approve',
            data,
            {
                withCredentials: true,
            }
        )
            .subscribe({
                next: (responseData: { message: string }) => {
                    window.location.reload();
                },
                error: (error) => { console.log("Error toggling membership approved field") },
                complete: () => { }
            });
    }

    onOpenTransactionReceipts(username: string) {
        this.onOpenProfile(username);
    }

    onOpenProfile(username: string) {
        this.router.navigate(['/site/admin/user', username]);
    }

    onRedirectToAllNews() {
        this.router.navigate(['/site/news']);
    }

    filterMonthlyFee(hasPaid: string) {
        localStorage.setItem("filterMonthlyFee", hasPaid);
        localStorage.setItem("membershipsPageCounter", "1");
        this.pagecount.setUpComponent();
    }

    removeMonthlyFeeFilter() {
        localStorage.removeItem("filterMonthlyFee");
        localStorage.setItem("membershipsPageCounter", "1");
        this.pagecount.setUpComponent();
    }

    ngOnDestroy(): void {
        this.currentPageChangeSubscription.unsubscribe();
    }

}
