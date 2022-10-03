import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { myAnimations } from 'src/app/shared/animations/animations';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from '../auth/auth.service';
import { PageCountComponent } from '../news/news-list/page-count/page-count.component';

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.css'],
    animations: [
        myAnimations.appear,
        myAnimations.toggleOnOff,
        myAnimations.slideInList,
        myAnimations.slideIn
    ]
})
export class SupportComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("pagecount") pagecount: PageCountComponent;

    @ViewChild("popup") popup: PopupModalComponent;

    @ViewChild("ticketstatusfilterlabel") ticketStatusFilterLabelElement: ElementRef;

    popupName = "confirm";

    ticketList: {
        ticketId: number,
        title: string,
        content: string,
        issuerName: string,
        createDate: string,
        closed: boolean
    }[] = [];

    currentPage: number = 1;

    currentPageSubject = new Subject<{
        currentPage: number,
        filter: boolean,
        filterLabel: string
    }>();

    currentPageChangeSubscription = new Subscription();

    entriesPerPage: number = 10;

    isAdmin = false;

    editMode = false;

    markedForDeleteId: number = null;

    ticketStatusFilter: boolean = null;

    ticketStatusFilterLabel: string = "";

    constructor(private http: HttpClient, private router: Router, private authService: AuthService, private popupModalService: PopupModalService, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.currentPageChangeSubscription = this.currentPageSubject.subscribe({
            next: (val) => {
                this.ticketStatusFilter = val.filter;
                this.ticketStatusFilterLabel = val.filterLabel;
                this.changeDetectorRef.detectChanges();
                if (this.ticketStatusFilterLabelElement && this.ticketStatusFilter != null) {
                    this.ticketStatusFilterLabelElement.nativeElement.innerText = this.ticketStatusFilterLabel;
                }
                this.getTickets(val.filter);
            }
        });
    }

    ngAfterViewInit(): void {
        if (this.isAdmin) {
            this.popupModalService.setModal(this.popupName, this.popup);
        }
        if (this.ticketStatusFilter != null) {
            this.ticketStatusFilterLabelElement.nativeElement.innerText = this.ticketStatusFilterLabel;
        }
    }

    setCurrentPage(value: { currentPage: number, filter: boolean, filterLabel: string }) {
        this.scrollToTop();
        this.currentPage = value.currentPage;
        this.currentPageSubject.next(value);
    }

    scrollToTop() {
        document.body.scrollTo(0, 0);
    }

    getTickets(filter: boolean) {
        let params = new HttpParams().set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage);
        if (filter != null) {
            params = params.set("filterTicketStatus", filter);
        }
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

    toggleEditMode() {
        this.editMode = this.isAdmin && !this.editMode;
    }

    onDeleteTicket(ticketId: number) {
        this.markedForDeleteId = ticketId;
        this.popupModalService.openPopup(this.popupName);
    }

    deleteTicket() {
        this.http.post(
            'http://localhost:8080/api/admin/support/ticket/delete',
            this.markedForDeleteId,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData) => {
                    window.location.reload();
                },
                error: (error) => { console.log("Error deleting ticket") },
                complete: () => { }
            });
    }
    onConfirm() {
        this.deleteTicket();
    }

    closePopup() {
        this.markedForDeleteId = null;
        this.popupModalService.closePopup(this.popupName);
    }

    filterTicketStatus(status: string) {
        localStorage.setItem("filterTicketStatus", status);
        localStorage.setItem("ticketsPageCounter", "1");
        this.pagecount.setUpComponent();
    }

    removeTicketStatusFilter() {
        localStorage.removeItem("filterTicketStatus");
        localStorage.setItem("ticketsPageCounter", "1");
        this.pagecount.setUpComponent();
    }

    ngOnDestroy(): void {
        if (this.isAdmin) {
            this.popupModalService.unsetModal(this.popupName);
        }
    }

}
