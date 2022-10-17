import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { myAnimations } from 'src/app/shared/animations/animations';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from '../auth/auth.service';
import { SupportPageCountComponent } from './support-page-count/support-page-count.component';

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

    @ViewChild("pagecount") pagecount: SupportPageCountComponent;

    @ViewChild("deletepopup") deletePopup: PopupModalComponent;

    @ViewChild("submitpopup") submitPopup: PopupModalComponent;

    @ViewChild("ticketstatusfilterlabel") ticketStatusFilterLabelElement: ElementRef;

    deletePopupName = "confirm";

    submitPopupName = "feedback";

    ticketList: {
        ticketId: number,
        title: string,
        content: string,
        issuerName: string,
        createDate: string,
        closed: boolean,
        viewed: boolean,
        unreadComments: number
    }[] = [];

    currentPage: number = 1;

    currentPageSubject = new Subject<{
        currentPage: number,
        filter: boolean,
        filterLabel: string,
        searchTerm: string
    }>();

    currentPageChangeSubscription = new Subscription();

    entriesPerPage: number = 10;

    isAdmin = false;

    isClient = false;

    editMode = false;

    markedForDeleteId: number = null;

    ticketStatusFilter: boolean = null;

    ticketStatusFilterLabel: string = "";

    searchTerm: string = "";

    searchTermResult = false;

    supportEmail = "kyokushindev@gmail.com";

    errorMessage = null;

    anonymousTicketEmail = "";

    anonymousTicketContent = "";

    anonymousTicketContentRowCount = 7;

    constructor(private http: HttpClient, private router: Router, private authService: AuthService, private popupModalService: PopupModalService, private changeDetectorRef: ChangeDetectorRef, private translate: TranslateService) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.isClient = this.authService.hasClientPrivileges();
        this.currentPageChangeSubscription = this.currentPageSubject.subscribe({
            next: (val) => {
                this.ticketStatusFilter = val.filter;
                this.ticketStatusFilterLabel = val.filterLabel;
                this.searchTerm = val.searchTerm;
                this.changeDetectorRef.detectChanges();
                if (this.ticketStatusFilterLabelElement && this.ticketStatusFilter != null) {
                    this.ticketStatusFilterLabelElement.nativeElement.innerText = this.ticketStatusFilterLabel;
                }
                if (!val.searchTerm) {
                    this.getTickets();
                } else {
                    this.searchTicket();
                }
            }
        });
    }

    ngAfterViewInit(): void {
        if (this.isAdmin) {
            this.popupModalService.setModal(this.deletePopupName, this.deletePopup);
        }
        if (!this.isAdmin && !this.isClient) {
            this.popupModalService.setModal(this.submitPopupName, this.submitPopup);
        }
        if (this.ticketStatusFilter != null) {
            this.ticketStatusFilterLabelElement.nativeElement.innerText = this.ticketStatusFilterLabel;
        }
    }

    setCurrentPage(value: { currentPage: number, filter: boolean, filterLabel: string, searchTerm: string }) {
        this.scrollToTop();
        this.currentPage = value.currentPage;
        this.currentPageSubject.next(value);
    }

    scrollToTop() {
        document.body.scrollTo(0, 0);
    }

    getTickets() {
        let params = new HttpParams().set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage);
        if (this.ticketStatusFilter != null) {
            params = params.set("filterTicketStatus", this.ticketStatusFilter);
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
                    closed: boolean,
                    viewed: boolean,
                    unreadComments: number
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
        this.popupModalService.openPopup(this.deletePopupName);
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

    onCancel() {
        this.markedForDeleteId = null;
        this.popupModalService.closePopup(this.deletePopupName);
    }

    filterTicketStatus(status: string) {
        this.searchTermResult = false;
        localStorage.setItem("filterTicketStatus", status);
        localStorage.setItem("ticketsPageCounter", "1");
        this.pagecount.setUpComponent();
    }

    removeTicketStatusFilter() {
        this.searchTermResult = false;
        localStorage.removeItem("filterTicketStatus");
        localStorage.setItem("ticketsPageCounter", "1");
        this.pagecount.setUpComponent();
    }

    handleEnterPress(event: KeyboardEvent) {
        if (event.key == "Enter") {
            this.setupSearch();
        }
    }

    searchTicketOnClick(term: string) {
        this.searchTerm = term;
        this.setupSearch();
    }

    setupSearch() {
        if (!this.searchTerm) {
            return;
        }

        localStorage.removeItem("filterTicketStatus");
        localStorage.setItem("ticketsPageCounter", "1");
        this.pagecount.setUpComponent(this.searchTerm);
    }

    searchTicket() {
        if (!this.searchTerm) {
            return;
        }

        this.currentPage = 1;
        let params = new HttpParams().set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage).set("searchTerm", this.searchTerm);
        this.http.get(
            'http://localhost:8080/api/admin/support/ticket/search',
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
                    closed: boolean,
                    viewed: boolean,
                    unreadComments: number
                }[]) => {
                    this.ticketList = responseData.length > 0 ? responseData : [];
                    this.searchTermResult = true;
                },
                error: (error) => { console.log("Error searching ticket") },
                complete: () => { }
            });
    }

    removeSearchTerm() {
        this.searchTerm = "";
        this.searchTermResult = false;
        localStorage.setItem("ticketsPageCounter", "1");
        this.pagecount.setUpComponent();
    }

    redirectToRegister() {
        this.router.navigate(['/register']);
    }

    redirectToLogin() {
        this.router.navigate(['/login']);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 991) {
            this.anonymousTicketContentRowCount = 12;
        } else {
            this.anonymousTicketContentRowCount = 7;
        }
    }

    onSubmit(form: NgForm) {
        if (form.form.invalid) {
            this.translate.get("site.support.main.error.ticket")
                .subscribe((value: string) => {
                    this.errorMessage = value;
                });
            return;
        }
        this.errorMessage = null;
        let data = {
            content: form.form.value.content,
            issuerEmail: form.form.value.email,
            issuerLanguage: this.translate.currentLang.toUpperCase()
        };

        this.http.post(
            'http://localhost:8080/api/support/ticket/create_anonymous',
            data,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.submitPopupName);
                },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    closePopup() {
        this.popupModalService.closePopup(this.submitPopupName);
        window.location.reload();
    }

    ngOnDestroy(): void {
        if (this.isAdmin) {
            this.popupModalService.unsetModal(this.deletePopupName);
        }
        if (!this.isAdmin && !this.isClient) {
            this.popupModalService.unsetModal(this.submitPopupName);
        }
    }

}
