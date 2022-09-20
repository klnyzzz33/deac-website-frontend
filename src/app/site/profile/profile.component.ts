import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    profileData: {
        username: string,
        email: string,
        memberSince: string,
        hasPaidMembershipFee: boolean,
        monthlyTransactionReceiptPath: string,
        approved: boolean
    } = {
            username: "",
            email: "",
            memberSince: "",
            hasPaidMembershipFee: false,
            monthlyTransactionReceiptPath: "",
            approved: false
        };

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
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
                    username: string,
                    email: string,
                    memberSince: string,
                    hasPaidMembershipFee: boolean,
                    monthlyTransactionReceiptPath: string,
                    approved: boolean
                }) => {
                    this.profileData = responseMessage;
                },
                error: (error) => { console.log("Error getting username") },
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
