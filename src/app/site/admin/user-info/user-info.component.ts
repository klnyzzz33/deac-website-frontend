import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PRIMARY_OUTLET, Router } from '@angular/router';
import { myAnimations } from 'src/app/shared/animations/animations';

@Component({
    selector: 'app-user-info',
    templateUrl: './user-info.component.html',
    styleUrls: ['./user-info.component.css'],
    animations: [
        myAnimations.slideInList,
        myAnimations.slideIn,
        myAnimations.appear
    ]
})
export class UserInfoComponent implements OnInit {

    userProfileInfo: {
        fullName: string,
        username: string,
        email: string,
        memberSince: string,
        enabled: boolean,
        verified: boolean,
        hasPaidMembershipFee: boolean,
        approved: boolean
    } = {
            fullName: "",
            username: "",
            email: "",
            memberSince: "",
            enabled: false,
            verified: false,
            hasPaidMembershipFee: false,
            approved: false
        };

    transactionList: {
        yearMonth: string,
        monthlyTransactionReceiptPath: string
    }[] = [];

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
        let segments = this.router.parseUrl(this.router.url).root.children[PRIMARY_OUTLET].segments;
        this.setUpComponent(segments[segments.length - 1].path);
    }

    setUpComponent(username: string) {
        this.getUserProfileData(username);
    }

    getUserProfileData(username: string) {
        this.http.post(
            'http://localhost:8080/api/admin/memberships/profile',
            username,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseMessage: {
                    fullName: string,
                    username: string,
                    email: string,
                    memberSince: string,
                    enabled: boolean,
                    verified: boolean,
                    hasPaidMembershipFee: boolean,
                    approved: boolean
                }) => {
                    this.userProfileInfo = responseMessage;
                    this.listTransactions();
                },
                error: (error) => { this.router.navigate(['/site/admin/dashboard']) },
                complete: () => { }
            });
    }

    listTransactions() {
        this.http.post(
            'http://localhost:8080/api/admin/memberships/profile/transactions/list',
            this.userProfileInfo.username,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseMessage: {
                    yearMonth: string,
                    monthlyTransactionReceiptPath: string
                }[]) => {
                    this.transactionList = responseMessage;
                },
                error: (error) => { console.log("Error getting user transactions") },
                complete: () => { }
            });
    }

    onDownloadReceipt(receiptPath: string) {
        let params = new HttpParams().set("username", this.userProfileInfo.username).set("receiptPath", receiptPath);
        this.http.post(
            'http://localhost:8080/api/admin/memberships/profile/transactions/download',
            null,
            {
                withCredentials: true,
                params: params,
                responseType: 'arraybuffer'
            }
        )
            .subscribe({
                next: (responseMessage: ArrayBuffer) => {
                    let blob = new Blob([responseMessage], { type: 'application/pdf' });
                    let fileUrl = URL.createObjectURL(blob);
                    window.open(fileUrl, '_blank');
                },
                error: (error) => { console.log("Error downloading receipt") },
                complete: () => { }
            });
    }

}
