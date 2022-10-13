import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { myAnimations } from 'src/app/shared/animations/animations';
import { MembershipsPageCountComponent } from './memberships-page-count/memberships-page-count.component';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css'],
    animations: [
        myAnimations.slideInList,
        myAnimations.slideIn,
        myAnimations.appear
    ]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("pagecount") pagecount: MembershipsPageCountComponent;

    @ViewChild("monthlyfeefilterlabel") monthlyFeeFilterLabelElement: ElementRef;

    @ViewChild("searchuser") searchUserElement: ElementRef;

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

    searchTerm = "";

    searchTermResult: any = null;

    enableLabel = "";

    disableLabel = "";

    enabledLabel = "";

    disabledLabel = "";

    constructor(private http: HttpClient, private router: Router, private changeDetectorRef: ChangeDetectorRef, private translate: TranslateService) { }

    ngOnInit(): void {
        this.translate.get("site.admin.main.memberships.enable")
            .subscribe((value: string) => {
                this.enableLabel = value;
            });
        this.translate.get("site.admin.main.memberships.disable")
            .subscribe((value: string) => {
                this.disableLabel = value;
            });
        this.translate.get("site.admin.main.memberships.enabled")
            .subscribe((value: string) => {
                this.enabledLabel = value;
            });
        this.translate.get("site.admin.main.memberships.disabled")
            .subscribe((value: string) => {
                this.disabledLabel = value;
            });
        this.currentPageChangeSubscription = this.currentPageSubject.subscribe({
            next: (val) => {
                let filter: boolean;
                let paidLabel = null;
                this.translate.get("site.admin.main.filter.option_1")
                    .subscribe((value: string) => {
                        paidLabel = value;
                        let item = localStorage.getItem("filterMonthlyFee");
                        switch (item) {
                            case null:
                                filter = null;
                                break;
                            case paidLabel:
                                filter = true;
                                break;
                            default:
                                filter = false;
                        }
                        this.monthlyFeeFilter = filter;
                        this.monthlyFeeFilterLabel = item;
                        this.changeDetectorRef.detectChanges();
                        if (this.monthlyFeeFilterLabelElement && this.monthlyFeeFilter != null) {
                            this.monthlyFeeFilterLabelElement.nativeElement.innerText = this.monthlyFeeFilterLabel;
                        }
                        if (this.searchTermResult != null) {
                            this.membershipList = this.searchTermResult != "No result" ? [this.searchTermResult] : [];
                        } else {
                            if (this.searchUserElement) {
                                this.searchTerm = "";
                            }
                            this.getMembershipEntries(filter);
                        }
                    });
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
        this.router.navigate(['/site/admin/user'], {
            queryParams: {
                username: username
            }
        });
    }

    onNavigateToCreateReceipt() {
        this.router.navigate(['/site/admin/user/create-receipt']);
    }

    onRedirectToAllNews() {
        this.router.navigate(['/site/news']);
    }

    filterMonthlyFee(hasPaid: string) {
        this.searchTermResult = null;
        localStorage.setItem("filterMonthlyFee", hasPaid);
        localStorage.setItem("membershipsPageCounter", "1");
        this.pagecount.setUpComponent();
    }

    removeMonthlyFeeFilter() {
        this.searchTermResult = null;
        localStorage.removeItem("filterMonthlyFee");
        localStorage.setItem("membershipsPageCounter", "1");
        this.pagecount.setUpComponent();
    }

    handleEnterPress(event: KeyboardEvent) {
        if (event.key == "Enter") {
            this.searchUser();
        }
    }

    searchUser() {
        if (!this.searchTerm) {
            return;
        }

        let params = new HttpParams().set("searchTerm", this.searchTerm);
        this.http.get(
            'http://localhost:8080/api/admin/memberships/search',
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
                }) => {
                    this.searchTermResult = responseData ? responseData : "No result";
                    localStorage.removeItem("filterMonthlyFee");
                    localStorage.setItem("membershipsPageCounter", "1");
                    this.pagecount.setUpComponent(true);
                },
                error: (error) => { console.log("Error searching user") },
                complete: () => { }
            });
    }

    removeSearchTerm() {
        this.searchTerm = "";
        this.searchTermResult = null;
        this.pagecount.setUpComponent(false);
    }

    changeEnabledLabel(element: any, enabled: boolean) {
        element.innerText = enabled ? this.disableLabel : this.enableLabel;
    }

    undoChangeEnabledLabel(element: any, enabled: boolean) {
        element.innerText = enabled ? this.enabledLabel : this.disabledLabel;
    }

    ngOnDestroy(): void {
        this.currentPageChangeSubscription.unsubscribe();
    }

}
