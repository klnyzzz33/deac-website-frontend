import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-verify',
    templateUrl: './verify.component.html',
    styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

    token = "";

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.token = params.token;
            }
            );
        this.onVerify();
    }

    onVerify() {
        if (!this.token) {
            this.router.navigate(['login']);
        }

        this.http.post(
            'http://localhost:8080/api/user/verify',
            this.token,
            { responseType: 'json' }
        )
            .subscribe({
                next: (responseData) => {
                    this.router.navigate(['login'], {
                        state: {
                            isVerifiedSuccessful: true
                        }
                    });
                },
                error: (error) => {
                    this.router.navigate(['login'], {
                        state: {
                            isVerifiedSuccessful: false
                        }
                    });
                },
                complete: () => { }
            });
    }

}
