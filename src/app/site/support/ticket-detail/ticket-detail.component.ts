import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { myAnimations } from 'src/app/shared/animations/animations';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-ticket-detail',
    templateUrl: './ticket-detail.component.html',
    styleUrls: ['./ticket-detail.component.css'],
    animations: [
        myAnimations.appear,
        myAnimations.slideInList,
        myAnimations.slideIn
    ]
})
export class TicketDetailComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "feedback";

    ticketId: number = null;

    ticketDetails: {
        ticketId: number,
        title: string,
        content: string,
        issuerName: string,
        createDate: string,
        closed: boolean,
        comments: {
            content: string,
            issuerName: string,
            issuerRoles: string[],
            createDate: string
        }[]
    } = {
            ticketId: 0,
            title: "",
            content: "",
            issuerName: "",
            createDate: "",
            closed: false,
            comments: []
        };

    errorMessage = null;

    createCommentMode = false;

    commentContent = "";

    commentContentRowCount = 7;

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private popupModalService: PopupModalService) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.ticketId = params.id;
            }
            );
        if (!this.ticketId) {
            this.router.navigate(['/site/support']);
            return;
        }
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
        this.getTicketDetails();
    }

    getTicketDetails() {
        let params = new HttpParams().set("id", this.ticketId);
        this.http.get(
            'http://localhost:8080/api/support/ticket/open',
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
                    comments: {
                        content: string,
                        issuerName: string,
                        issuerRoles: string[],
                        createDate: string
                    }[]
                }) => {
                    this.ticketDetails = responseData;
                    this.ticketDetails.comments.forEach(comment => {
                        for (var i = 0; i < comment.issuerRoles.length; i++) {
                            if (comment.issuerRoles[i] == "CLIENT") {
                                comment["commentType"] = "client";
                                break;
                            } else if (comment.issuerRoles[i] == "ADMIN") {
                                comment["commentType"] = "admin";
                                break;
                            }
                        }
                    });
                },
                error: (error) => {
                    console.log("Error getting ticket details");
                    this.router.navigate(['/site/support']);
                },
                complete: () => { }
            });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 991) {
            this.commentContentRowCount = 12;
        } else {
            this.commentContentRowCount = 7;
        }
    }

    onShowCreateCommentForm() {
        this.errorMessage = null;
        this.createCommentMode = !this.createCommentMode;
    }

    onSubmitPostComment(form: NgForm) {
        let data = form.form.value;
        if (form.form.invalid) {
            this.errorMessage = "Invalid data specified";
            return;
        }

        this.http.post(
            'http://localhost:8080/api/support/ticket/comment',
            {
                ticketId: this.ticketDetails.ticketId,
                content: data["commentContent"]
            },
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.popupName);
                },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    closePopup() {
        this.popupModalService.closePopup(this.popupName);
        window.location.reload();
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
