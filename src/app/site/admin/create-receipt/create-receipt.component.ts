import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
    selector: 'app-create-receipt',
    templateUrl: './create-receipt.component.html',
    styleUrls: ['./create-receipt.component.css']
})
export class CreateReceiptComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "feedback";

    errorMessage = null;

    currency: string;

    username: string;

    currentDate = new Date();

    currentDateString = "";

    minDateString = "";

    numberRegex = new RegExp("^[0-9]*$");

    items: {
        month: string,
        amount: number
    }[];

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private popupModalService: PopupModalService) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.username = params.username;
            });
        this.getCurrency();
        let tmp = new Date();
        let maxDate = new Date(tmp.setMonth(tmp.getMonth() + 1));
        let maxYear = maxDate.getFullYear();
        let maxMonth = maxDate.getMonth();
        let minDate = new Date(tmp.setMonth(tmp.getMonth() - 12));
        let minYear = minDate.getFullYear();
        let minMonth = minDate.getMonth();
        if (maxMonth < 10) {
            this.currentDateString = maxYear + "-0" + maxMonth;
        } else {
            this.currentDateString = maxYear + "-" + maxMonth;
        }
        if (minMonth < 10) {
            this.minDateString = minYear + "-0" + minMonth;
        } else {
            this.minDateString = minYear + "-" + minMonth;
        }
        this.items = [{
            month: this.currentDateString,
            amount: 0
        }];
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
    }

    getCurrency() {
        this.http.post(
            'http://localhost:8080/api/admin/payment/currency',
            null,
            {
                withCredentials: true,
            }
        )
            .subscribe({
                next: (responseData: { message: string }) => {
                    this.currency = responseData.message;
                },
                error: (error) => { console.log("Error getting currency") },
                complete: () => { }
            });
    }

    changeDate(date: any, index: number) {
        this.items[index].month = date.value;
    }

    validateAmountValue(amount: any, index: number) {
        if (amount.value.length > 1 && amount.value.charAt(0) === "0") {
            amount.value = amount.value.slice(1);
        }
        let i = 0;
        while (i < amount.value.length) {
            var char = amount.value.charAt(i);
            if (!this.numberRegex.test(char)) {
                amount.value = amount.value.slice(0, i) + amount.value.slice(i + 1);
            } else {
                i++;
            }
        }
        this.items[index].amount = Number(amount.value);
    }

    addItem() {
        this.items.push({
            month: "",
            amount: 0
        });
    }

    removeItem(index: number) {
        this.items = this.items.slice(0, index).concat(this.items.slice(index + 1));
    }

    onSubmit(form: NgForm) {
        let data = form.form.value;

        if (form.form.invalid) {
            this.errorMessage = "Receipt creation failed";
            return;
        }

        let uniqueElements = new Set();
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.amount == 0) {
                this.errorMessage = "Invalid amount";
                return;
            }
            if (!item.month) {
                this.errorMessage = "Invalid date";
                return;
            }
            var date = new Date(item.month + "-01");
            if (date.getFullYear() < 2000
                || date.getFullYear() > this.currentDate.getFullYear()
                || (date.getFullYear() == this.currentDate.getFullYear() && date.getMonth() > this.currentDate.getMonth())) {
                this.errorMessage = "Invalid date";
                return;
            }
            if (!uniqueElements.has(item.month)) {
                uniqueElements.add(item.month);
            } else {
                this.errorMessage = "Duplicate month";
                return;
            }
        }

        data["items"] = this.items;
        this.http.post(
            'http://localhost:8080/api/admin/payment/save_manual',
            data,
            {
                withCredentials: true,
            }
        )
            .subscribe({
                next: (responseData: { message: string }) => {
                    this.popupModalService.openPopup(this.popupName);
                },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    onRedirectToAdminDashboard() {
        this.popupModalService.closePopup(this.popupName);
        this.router.navigate(['/site/admin/dashboard']);
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
