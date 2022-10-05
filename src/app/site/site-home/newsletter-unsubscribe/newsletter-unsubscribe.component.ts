import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-newsletter-unsubscribe',
    templateUrl: './newsletter-unsubscribe.component.html',
    styleUrls: ['./newsletter-unsubscribe.component.css']
})
export class NewsletterUnsubscribeComponent implements OnInit {

    token = "";

    email = "";

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.token = params.token;
                this.email = params.email;
            }
            );
        this.onUnsubscribe();
    }

    onUnsubscribe() {
        if (!this.token || !this.email) {
            this.router.navigate(['/site/home']);
        }
        let data = {
            email: this.email,
            token: this.token
        };

        this.http.post(
            'http://localhost:8080/api/mailinglist/unsubscribe',
            data,
            { responseType: 'json' }
        )
            .subscribe({
                next: (responseData) => {
                    this.router.navigate(['/site/home'], {
                        state: {
                            isUnsubscribeSuccessful: true
                        }
                    });
                },
                error: (error) => {
                    this.router.navigate(['/site/home'], {
                        state: {
                            isUnsubscribeSuccessful: false
                        }
                    });
                },
                complete: () => { }
            });
    }

}
