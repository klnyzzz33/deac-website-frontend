import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    username = "";

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
        this.setUpComponent();
    }

    setUpComponent() {
        this.getUser();
    }

    getUser() {
        this.http.get(
            'http://localhost:8080/api/user/current_user',
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseMessage: { message: string }) => { this.username = responseMessage.message },
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
                    this.router.navigate(['']);
                },
                error: (error) => { console.log("Error logging out") },
                complete: () => { }
            });
    }

}
