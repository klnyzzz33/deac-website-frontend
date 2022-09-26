import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { myAnimations } from 'src/app/shared/animations/animations';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    animations: [
        myAnimations.slideIn,
        myAnimations.slideInList
    ]
})
export class ProfileComponent implements OnInit {

    isAdmin = false;

    profileData: {
        fullName: string,
        username: string,
        email: string,
        memberSince: string,
        hasPaidMembershipFee: boolean,
        approved: boolean
    } = {
            fullName: "",
            username: "",
            email: "",
            memberSince: "",
            hasPaidMembershipFee: false,
            approved: false
        };

    transactionList: {
        yearMonth: string,
        monthlyTransactionReceiptPath: string
    }[] = [];

    constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.setUpComponent();
    }

    setUpComponent() {
        this.getProfileData();
    }

    getProfileData() {
        this.http.get(
            'http://localhost:8080/api/memberships/profile',
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
                    hasPaidMembershipFee: boolean,
                    approved: boolean
                }) => {
                    this.profileData = responseMessage;
                },
                error: (error) => { console.log("Error getting username") },
                complete: () => { }
            });
    }

    onListTransactions() {
        this.http.get(
            'http://localhost:8080/api/memberships/profile/transactions/list',
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
                error: (error) => { console.log("Error getting transactions") },
                complete: () => { }
            });
    }

    onDownloadReceipt(receiptPath: string) {
        this.http.post(
            'http://localhost:8080/api/memberships/profile/transactions/download',
            receiptPath,
            {
                withCredentials: true,
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

    onLogout() {
        this.http.get(
            'http://localhost:8080/api/user/logout',
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData) => {
                    localStorage.clear();
                    this.router.navigate(['/site']);
                },
                error: (error) => {
                    console.log("Error logging out");
                    localStorage.clear();
                    this.router.navigate(['/site']);
                },
                complete: () => { }
            });
    }

    onRedirectToResetPassword() {
        this.router.navigate(["/forgot-password"]);
    }

    onNavigateToCheckout() {
        this.router.navigate(["/site/profile/checkout"]);
    }

}
