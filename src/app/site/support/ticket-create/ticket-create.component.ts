import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-ticket-create',
    templateUrl: './ticket-create.component.html',
    styleUrls: ['./ticket-create.component.css']
})
export class TicketCreateComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "feedback";

    errorMessage = null;

    content = "";

    contentRowCount = 7;

    attachmentFiles: File[] = [];

    constructor(private http: HttpClient, private router: Router, private authService: AuthService, private popupModalService: PopupModalService) { }

    ngOnInit(): void {
        if (this.authService.hasAdminPrivileges()) {
            this.router.navigate(['/site/support']);
            return;
        }
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
    }

    onSubmit(form: NgForm) {
        if (form.form.invalid) {
            this.errorMessage = "Invalid data specified";
            return;
        }
        let data = new FormData();
        data.append("content", form.form.value["content"]);
        for (var i = 0; i < this.attachmentFiles.length; i++) {
            data.append("file", this.attachmentFiles[i], this.attachmentFiles[i].name);
        }

        this.http.post(
            'http://localhost:8080/api/support/ticket/create',
            data,
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
            this.contentRowCount = 12;
        } else {
            this.contentRowCount = 7;
        }
    }

    onRedirectToAllTickets() {
        this.router.navigate(['/site/support']);
    }

    closePopup() {
        this.popupModalService.closePopup(this.popupName);
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
