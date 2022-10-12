import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { myAnimations } from 'src/app/shared/animations/animations';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from '../../auth/auth.service';
import { HeaderService } from '../../header/header.service';

@Component({
    selector: 'app-ticket-detail',
    templateUrl: './ticket-detail.component.html',
    styleUrls: ['./ticket-detail.component.css'],
    animations: [
        myAnimations.appear,
        myAnimations.slideInList,
        myAnimations.slideIn,
        myAnimations.toggleOnOff
    ]
})
export class TicketDetailComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("commentpopup") commentPopup: PopupModalComponent;

    @ViewChild("deletepopup") deletePopup: PopupModalComponent;

    commentPopupName = "feedback";

    deletePopupName = "confirm";

    ticketId: number = null;

    ticketDetails: {
        ticketId: number,
        title: string,
        content: string,
        issuerName: string,
        createDate: string,
        closed: boolean,
        attachments: string[],
        comments: {
            commentId: number,
            title: string,
            content: string,
            issuerName: string,
            createDate: string,
            attachments: string[],
            viewed: boolean
        }[],
        viewed: boolean
    } = {
            ticketId: 0,
            title: "",
            content: "",
            issuerName: "",
            createDate: "",
            closed: false,
            attachments: [],
            comments: [],
            viewed: false
        };

    errorMessage = null;

    createCommentMode = false;

    commentContent = "";

    commentContentRowCount = 7;

    attachmentFiles: File[] = [];

    isAdmin = false;

    isClient = false;

    deleteMode: string = null;

    markedForDeleteId: number = null;

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private authService: AuthService, private popupModalService: PopupModalService, private headerService: HeaderService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.ticketId = params.id;
            });
        if (!this.ticketId) {
            this.router.navigate(['/site/support']);
            return;
        }
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.isClient = this.authService.hasClientPrivileges();
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.commentPopupName, this.commentPopup);
        if (this.isAdmin) {
            this.popupModalService.setModal(this.deletePopupName, this.deletePopup);
        }
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
                    attachments: string[],
                    comments: {
                        commentId: number,
                        title: string,
                        content: string,
                        issuerName: string,
                        createDate: string,
                        attachments: string[],
                        viewed: boolean
                    }[],
                    viewed: boolean
                }) => {
                    this.ticketDetails = responseData;
                    if (this.isAdmin && !this.ticketDetails.viewed) {
                        this.markTicketAsRead();
                    }
                    let markCommentsAsRead = 0;
                    this.ticketDetails.comments.forEach(comment => {
                        if ((comment.issuerName == this.ticketDetails.issuerName && this.isClient)
                            || (comment.issuerName != this.ticketDetails.issuerName && this.isAdmin)) {
                            comment["commentType"] = "me";
                        } else if ((comment.issuerName == this.ticketDetails.issuerName && this.isAdmin)
                            || (comment.issuerName != this.ticketDetails.issuerName && this.isClient)) {
                            comment["commentType"] = "partner";
                        }
                        if (!comment.viewed && comment["commentType"] == "partner") {
                            markCommentsAsRead += 1;
                        }
                    });
                    if (markCommentsAsRead > 0) {
                        this.markCommentsAsRead(markCommentsAsRead);
                    }
                },
                error: (error) => {
                    console.log("Error getting ticket details");
                    this.router.navigate(['/site/support']);
                },
                complete: () => { }
            });
    }

    markTicketAsRead() {
        this.http.post(
            'http://localhost:8080/api/admin/support/ticket/read',
            this.ticketDetails.ticketId,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData) => { this.headerService.changeSupportNotificationCount(-1) },
                error: (error) => { console.log("Error marking ticket as read") },
                complete: () => { }
            });
    }

    markCommentsAsRead(count: number) {
        this.http.post(
            'http://localhost:8080/api/support/ticket/comment/read',
            this.ticketDetails.ticketId,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData) => {
                    if (!this.isAdmin) {
                        this.headerService.changeSupportNotificationCount(-count);
                    }
                },
                error: (error) => { console.log("Error marking ticket comments as read") },
                complete: () => { }
            });
    }

    onToggleResolved() {
        let params = new HttpParams().set("value", !this.ticketDetails.closed);
        this.http.post(
            'http://localhost:8080/api/admin/support/ticket/close',
            this.ticketDetails.ticketId,
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData) => {
                    window.location.reload();
                },
                error: (error) => { console.log("Error toggling ticket status") },
                complete: () => { }
            });
    }

    onDeleteTicket() {
        this.deleteMode = "ticket";
        this.markedForDeleteId = this.ticketDetails.ticketId;
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
                    setTimeout(() => {
                        this.router.navigate(['/site/support']);
                    }, 1000);
                },
                error: (error) => { console.log("Error deleting ticket") },
                complete: () => { }
            });
    }

    onDownloadAttachment(file: string) {
        let params = new HttpParams().set("ticketId", this.ticketDetails.title).set("attachmentPath", file);
        this.http.post(
            'http://localhost:8080/api/support/ticket/download',
            null,
            {
                withCredentials: true,
                params: params,
                observe: 'response',
                responseType: 'arraybuffer'
            }
        )
            .subscribe({
                next: (responseData) => {
                    let blob = new Blob([responseData.body], { type: responseData.headers.get("Content-Type") });
                    let fileUrl = URL.createObjectURL(blob);
                    let newWindow = window.open(fileUrl, '_blank');
                    newWindow.onload = (event) => {
                        (<Document>event.target).title = file;
                    }
                },
                error: (error) => { console.log("Error downloading ticket attachment") },
                complete: () => { }
            });
    }

    onUploadFiles(event) {
        if (event.target.files && event.target.files[0]) {
            this.attachmentFiles = [];
            for (var i = 0; i < event.target.files.length; i++) {
                this.attachmentFiles.push(event.target.files[i]);
            }
        } else {
            this.attachmentFiles = [];
        }
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
        if (form.form.invalid) {
            this.translate.get("site.support.detail.error.comment")
                .subscribe((value: string) => {
                    this.errorMessage = value;
                });
            return;
        }
        this.errorMessage = null;
        let data = new FormData();
        data.append("ticketId", this.ticketDetails.ticketId.toString());
        data.append("content", form.form.value["commentContent"]);
        for (var i = 0; i < this.attachmentFiles.length; i++) {
            data.append("file", this.attachmentFiles[i], this.attachmentFiles[i].name);
        }

        this.http.post(
            'http://localhost:8080/api/support/ticket/comment',
            data,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.commentPopupName);
                },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    onDownloadCommentAttachment(file: string, commentTitle: string) {
        let params = new HttpParams().set("ticketId", this.ticketDetails.title).set("commentId", commentTitle).set("attachmentPath", file);
        this.http.post(
            'http://localhost:8080/api/support/ticket/comment/download',
            null,
            {
                withCredentials: true,
                params: params,
                observe: 'response',
                responseType: 'arraybuffer'
            }
        )
            .subscribe({
                next: (responseData) => {
                    let blob = new Blob([responseData.body], { type: responseData.headers.get("Content-Type") });
                    let fileUrl = URL.createObjectURL(blob);
                    let newWindow = window.open(fileUrl, '_blank');
                    newWindow.onload = (event) => {
                        (<Document>event.target).title = file;
                    }
                },
                error: (error) => { console.log("Error downloading ticket comment attachment") },
                complete: () => { }
            });
    }

    onDeleteComment(commentId: number) {
        this.deleteMode = "comment";
        this.markedForDeleteId = commentId;
        this.popupModalService.openPopup(this.deletePopupName);
    }

    deleteComment() {
        let params = new HttpParams().set("ticketId", this.ticketDetails.ticketId);
        this.http.post(
            'http://localhost:8080/api/admin/support/ticket/comment/delete',
            this.markedForDeleteId,
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData) => {
                    window.location.reload();
                },
                error: (error) => { console.log("Error deleting comment") },
                complete: () => { }
            });
    }

    onConfirm() {
        if (this.deleteMode == "ticket") {
            this.deleteTicket();
        } else if (this.deleteMode == "comment") {
            this.deleteComment();
        }
    }

    closePopup(popupName: string, reload: boolean) {
        this.deleteMode = null;
        this.markedForDeleteId = null;
        this.popupModalService.closePopup(popupName);
        if (reload) {
            window.location.reload();
        }
    }

    onSearchTicket(issuerName: string) {
        this.router.navigate(['/site/support'], {
            queryParams: {
                issuerName: issuerName
            }
        });
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.commentPopupName);
        if (!this.isAdmin) {
            this.popupModalService.unsetModal(this.deletePopupName);
        }
    }

}
